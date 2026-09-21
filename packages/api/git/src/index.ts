/**
 * Git working-tree service: status, unified diffs, staging, commits, and
 * recent history for the Session workspace, exposed as the `git` Remote
 * namespace.
 *
 * Every command runs through `ctx.subprocess` as an explicit argv with a
 * scrubbed environment; the service never shell-interprets input. Working
 * directories come from the Session header — live when the Session is open,
 * from persistence when it is cold, with the sandbox policy root as the
 * no-cwd fallback — so a Client names only a Session id, and the repository
 * root is located per call with `git rev-parse`. Staging and commits are the
 * only mutations, and each is exactly the requested one.
 */
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-subprocess'
import type {} from '@deepseek-ai/dsh-sandbox-policy'
import type {} from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-session-persistence'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { Remote, RemoteError, TypertRemoteService, type TypertLookup } from '@deepseek-ai/dsh-typert-protocol'
import { GitRunner, type GitRunResult } from './git-runner.ts'
import type { GitChangeEntry, GitCommit, GitDiff, GitStatus } from './types.ts'

export type * from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Host owner of the `git` Remote namespace. */
    git: Git
  }
}

/** Session-derived working directory every Git call runs in. */
export interface GitWorkspaceScope {
  /** Session identity received on the wire. */
  readonly sessionId: SessionId
  /** Session workspace root, or the deployment fallback when its header has no cwd. */
  readonly workspaceRoot: string
}

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface TypertLookupMap {
    /** Resolve a Session id to its workspace root without activating an Agent. */
    gitWorkspaceScope: TypertLookup<GitWorkspaceScope, SessionId>
  }
}

/** Deployment bounds on one Git command and its answers. */
export interface Config {
  /** Milliseconds one git command may run before it is terminated. */
  readonly timeoutMs: number
  /** Inclusive byte cap on one diff answer, and on the raw content fallback. */
  readonly maxDiffBytes: number
  /** Largest number of recent commits one history answer carries. */
  readonly maxHistory: number
}

/** Environment every command shares: literal path resolution, no prompts, no optional locks. */
const GIT_BASELINE_ENV: Readonly<Record<string, string>> = { GIT_LITERAL_PATHSPECS: '1' }

/** Split one `--porcelain=v1 -z` stream into change entries. */
function parsePorcelain(output: string): GitChangeEntry[] {
  const records = output.split('\0')
  const entries: GitChangeEntry[] = []
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index] as string
    if (record === '') continue
    const [x, y] = [record[0] ?? ' ', record[1] ?? ' ']
    const path = record.slice(3)
    if (x === 'R' || x === 'C' || y === 'R' || y === 'C') {
      // In -z form, a rename or copy record is followed by its original path.
      entries.push({ path, from: records[index + 1] ?? '', index: x, worktree: y, untracked: false })
      index += 1
      continue
    }
    entries.push({ path, index: x, worktree: y, untracked: x === '?' })
  }
  return entries
}

/** Refuse a path set the command vocabulary cannot carry. */
function assertPaths(paths: readonly string[]): void {
  if (paths.length === 0) {
    throw new RemoteError('gateway/bad-request', 'at least one path is required', {})
  }
  for (const path of paths) {
    if (path === '' || path.includes('\0')) {
      throw new RemoteError('gateway/bad-request', 'paths must be non-empty and must not contain NUL', {})
    }
  }
}

/** Host Git operations over the Session workspace. */
export class Git extends TypertRemoteService {
  static inject = ['subprocess', 'sandboxPolicy', 'sessions', 'typert']

  static Config: z<Config> = z.object({
    timeoutMs: z.number().step(1).min(1).default(20_000),
    maxDiffBytes: z.number().step(1).min(1).default(256 * 1024),
    maxHistory: z.number().step(1).min(1).max(500).default(30),
  })

  private executable: Promise<string> | undefined

  /**
   * @param ctx - Host context carrying subprocess, the sandbox policy, and sessions.
   * @param config - deployment bounds on commands and answers.
   */
  constructor(ctx: Context, private readonly config: Config) {
    super(ctx, 'git')
    ctx.inject(['sessions', 'typert'], (scope) => {
      scope.typert.lookups.register('gitWorkspaceScope', {
        parameter: 'gitWorkspaceScope',
        wire: 'gitWorkspaceScopeId',
        hostTypeSymbol: '@deepseek-ai/dsh-api-git#GitWorkspaceScope',
        wireTypeSymbol: '@deepseek-ai/dsh-session/types#SessionId',
        resolve: async (sessionId) => {
          const live = scope.sessions.get(sessionId)?.header
          const stored = live === undefined
            ? await scope.get('sessionPersistence')?.stat(sessionId)
            : undefined
          const header = live ?? stored?.header
          if (header === undefined) return undefined
          return { sessionId, workspaceRoot: header.cwd ?? scope.sandboxPolicy.workspaceRoot }
        },
      })
    })
  }

  /**
   * One working-tree snapshot: repository root, current branch, and every
   * changed path from `git status --porcelain=v1 -z`.
   * @param gitWorkspaceScope - the resolved Session workspace.
   * @param signal - caller cancellation.
   * @returns the snapshot a change list renders from.
   */
  @Remote
  async status(gitWorkspaceScope: GitWorkspaceScope, signal: AbortSignal): Promise<GitStatus> {
    const root = await this.repoRoot(gitWorkspaceScope, signal)
    const porcelain = await this.run(['status', '--porcelain=v1', '-z', '--untracked-files=all'], root, signal)
    const branch = await this.run(['branch', '--show-current'], root, signal)
    const name = branch.stdout.trim()
    return { repoRoot: root, branch: name === '' ? null : name, entries: parsePorcelain(porcelain.stdout) }
  }

  /**
   * One unified diff for a single path, either the index vs HEAD (`staged`) or
   * the work tree vs the index. An untracked path reads as an addition against
   * `/dev/null`, with the raw content as the last-resort fallback.
   * @param gitWorkspaceScope - the resolved Session workspace.
   * @param path - repo-root-relative path, exactly as status reported it.
   * @param staged - which side of the index to diff.
   * @param signal - caller cancellation.
   * @returns the diff text, capped by the configured byte limit.
   */
  @Remote
  async diff(gitWorkspaceScope: GitWorkspaceScope, path: string, staged: boolean, signal: AbortSignal): Promise<GitDiff> {
    assertPaths([path])
    const root = await this.repoRoot(gitWorkspaceScope, signal)
    const maxBytes = this.config.maxDiffBytes + 64 * 1024
    if (!staged) {
      let result = await this.run(['diff', '--no-color', '--no-ext-diff', '--', path], root, signal, { maxBytes, allowNonzero: true })
      this.assertDiffExit(result, path)
      if (result.stdout.trim() === '') {
        // No tracked change here: an untracked path diffs against /dev/null.
        const untracked = await this.run(
          ['diff', '--no-index', '--no-color', '--no-ext-diff', '--', '/dev/null', path],
          root, signal, { maxBytes, allowNonzero: true },
        )
        if (untracked.exitCode === 0 || untracked.exitCode === 1) {
          result = untracked
        } else {
          // A host without the /dev/null mapping: show the raw content instead.
          const content = await readFile(resolve(root, path), 'utf8').catch(() => undefined)
          return { path, staged, ...clamp(content ?? '', this.config.maxDiffBytes) }
        }
      }
      return { path, staged, ...clamp(result.stdout, this.config.maxDiffBytes) }
    }
    const cached = await this.run(['diff', '--cached', '--no-color', '--no-ext-diff', '--', path], root, signal, { maxBytes, allowNonzero: true })
    this.assertDiffExit(cached, path)
    return { path, staged, ...clamp(cached.stdout, this.config.maxDiffBytes) }
  }

  /**
   * Stage the named paths (`git add`), then answer the fresh snapshot.
   * @param gitWorkspaceScope - the resolved Session workspace.
   * @param paths - repo-root-relative paths to stage.
   * @param signal - caller cancellation.
   * @returns the snapshot after staging.
   */
  @Remote
  async stage(gitWorkspaceScope: GitWorkspaceScope, paths: readonly string[], signal: AbortSignal): Promise<GitStatus> {
    assertPaths(paths)
    const root = await this.repoRoot(gitWorkspaceScope, signal)
    await this.run(['add', '--', ...paths], root, signal)
    return await this.status(gitWorkspaceScope, signal)
  }

  /**
   * Unstage the named paths (`git reset`), then answer the fresh snapshot. An
   * unborn HEAD cannot resolve `reset`, so `git rm --cached` is the equivalent.
   * @param gitWorkspaceScope - the resolved Session workspace.
   * @param paths - repo-root-relative paths to unstage.
   * @param signal - caller cancellation.
   * @returns the snapshot after unstaging.
   */
  @Remote
  async unstage(gitWorkspaceScope: GitWorkspaceScope, paths: readonly string[], signal: AbortSignal): Promise<GitStatus> {
    assertPaths(paths)
    const root = await this.repoRoot(gitWorkspaceScope, signal)
    const reset = await this.run(['reset', '-q', '--', ...paths], root, signal, { allowNonzero: true })
    if (reset.exitCode !== 0) {
      await this.run(['rm', '--cached', '-q', '--', ...paths], root, signal)
    }
    return await this.status(gitWorkspaceScope, signal)
  }

  /**
   * Commit the current index with the given message, then answer the fresh snapshot.
   * @param gitWorkspaceScope - the resolved Session workspace.
   * @param message - commit message; surrounding whitespace is trimmed.
   * @param signal - caller cancellation.
   * @returns the snapshot after the commit.
   */
  @Remote
  async commit(gitWorkspaceScope: GitWorkspaceScope, message: string, signal: AbortSignal): Promise<GitStatus> {
    const text = message.trim()
    if (text === '') {
      throw new RemoteError('gateway/bad-request', 'the commit message must not be empty', {})
    }
    const root = await this.repoRoot(gitWorkspaceScope, signal)
    await this.run(['commit', '-m', text], root, signal)
    return await this.status(gitWorkspaceScope, signal)
  }

  /**
   * The most recent commits, newest first.
   * @param gitWorkspaceScope - the resolved Session workspace.
   * @param signal - caller cancellation.
   * @returns up to `maxHistory` commits; empty before the first commit exists.
   */
  @Remote
  async history(gitWorkspaceScope: GitWorkspaceScope, signal: AbortSignal): Promise<readonly GitCommit[]> {
    const root = await this.repoRoot(gitWorkspaceScope, signal)
    const log = await this.run(
      ['log', '--no-color', '-n', String(this.config.maxHistory), '--pretty=format:%h%x09%s'],
      root, signal, { allowNonzero: true },
    )
    if (log.exitCode !== 0) {
      if (/does not have any commits yet|bad default revision/i.test(log.stderr)) return []
      throw this.failure(`git log exited ${String(log.exitCode)}`, 'git log', log.stderr)
    }
    return log.stdout.split('\n').filter(line => line !== '').map((line) => {
      const tab = line.indexOf('\t')
      return tab === -1 ? { hash: line, subject: '' } : { hash: line.slice(0, tab), subject: line.slice(tab + 1) }
    })
  }

  /** The repository top-level for one scope, or a typed failure when there is none. */
  private async repoRoot(scope: GitWorkspaceScope, signal: AbortSignal): Promise<string> {
    const found = await this.run(['rev-parse', '--show-toplevel'], scope.workspaceRoot, signal, { allowNonzero: true })
    if (found.exitCode === 128 && /not a git repository/i.test(found.stderr)) {
      throw new RemoteError(
        'git/not-repository',
        `"${scope.workspaceRoot}" is not inside a git repository`,
        { workspaceRoot: scope.workspaceRoot },
      )
    }
    if (found.exitCode !== 0) {
      throw this.failure(`git rev-parse exited ${String(found.exitCode)}`, 'git rev-parse --show-toplevel', found.stderr)
    }
    return found.stdout.split('\n')[0]?.trim() ?? scope.workspaceRoot
  }

  /** Accept diff exit codes 0 and 1; anything else is a command failure. */
  private assertDiffExit(result: GitRunResult, path: string): void {
    if (result.exitCode !== 0 && result.exitCode !== 1) {
      throw this.failure(`git diff of "${path}" exited ${String(result.exitCode)}`, `git diff -- ${path}`, result.stderr)
    }
  }

  /** One `git/command-failed` value with a bounded stderr tail. */
  private failure(message: string, command: string, stderr: string): RemoteError {
    return new RemoteError('git/command-failed', message, { command, stderr: stderr.slice(0, 4_000) })
  }

  /** Resolve the git executable once per service lifetime. */
  private async gitExecutable(): Promise<string> {
    this.executable ??= this.ctx.subprocess.resolveExecutable('git').catch((cause: unknown) => {
      throw new RemoteError(
        'git/command-failed',
        `the git executable is unavailable: ${cause instanceof Error ? cause.message : String(cause)}`,
        { command: 'git', stderr: '' },
        { cause },
      )
    })
    return await this.executable
  }

  /**
   * Run one git command; a nonzero exit throws `git/command-failed` unless the
   * caller asked to inspect it.
   */
  private async run(
    args: readonly string[],
    cwd: string,
    signal: AbortSignal,
    options: { maxBytes?: number | undefined; allowNonzero?: boolean | undefined } = {},
  ): Promise<GitRunResult> {
    const executable = await this.gitExecutable()
    const runner = new GitRunner(this.ctx.subprocess, executable, {
      timeoutMs: this.config.timeoutMs,
      outputMaxBytes: 2 * 1024 * 1024,
    })
    const result = await runner.run(args, { cwd, env: GIT_BASELINE_ENV, maxBytes: options.maxBytes, signal })
    if (options.allowNonzero !== true && result.exitCode !== 0) {
      throw this.failure(
        `git ${args[0] ?? ''} failed: ${result.stderr.trim() === '' ? `exit ${String(result.exitCode)}` : result.stderr.trim()}`,
        `git ${args.join(' ')}`,
        result.stderr,
      )
    }
    return result
  }
}

/** Cut one answer to the configured byte cap. */
function clamp(text: string, limit: number): { text: string; truncated: boolean } {
  if (Buffer.byteLength(text, 'utf8') <= limit) return { text, truncated: false }
  return { text: Buffer.from(text, 'utf8').subarray(0, limit).toString('utf8'), truncated: true }
}

// The Loader accepts this module as the `git` row's plugin through its default
// export; the named export stays for direct (in-process) consumption.
export default Git
