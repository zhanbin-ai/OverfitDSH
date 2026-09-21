/**
 * One bounded git invocation through the subprocess capability.
 *
 * Adapted from the workspace-changes deliverable's runner: an explicit argv,
 * a scrubbed environment, a fixed termination grace, and collect-mode output
 * that stays readable after exit. Nothing here is shell-interpreted.
 */
import type { SubprocessRuntime } from '@deepseek-ai/dsh-subprocess'

/** Milliseconds a git child gets to exit after termination starts. */
const TERMINATE_GRACE_MS = 2_000
/** Retained stderr tail for diagnostics. */
const STDERR_TAIL_BYTES = 16 * 1024

/** Settled git command facts; a nonzero exit is a result, not an exception. */
export interface GitRunResult {
  readonly exitCode: number | null
  readonly stdout: string
  readonly stderr: string
  /** True when stdout hit the output cap and was cut. */
  readonly truncated: boolean
}

/** Per-command spawn facts. */
export interface GitRunOptions {
  /** Working directory for the command. */
  readonly cwd: string
  /** Environment names layered over the runner's baseline. */
  readonly env?: Readonly<Record<string, string>> | undefined
  /** In-memory stdout cap for this command, replacing the runner's default. */
  readonly maxBytes?: number | undefined
  readonly signal: AbortSignal
}

/** Bounds every git command runs under. */
export interface GitLimits {
  /** Milliseconds before a command is terminated. */
  readonly timeoutMs: number
  /** Default in-memory stdout cap in bytes. */
  readonly outputMaxBytes: number
}

/** Runs one resolved git executable with a scrubbed environment, timeout, and bounded output. */
export class GitRunner {
  constructor(
    private readonly subprocess: SubprocessRuntime,
    private readonly executable: string,
    private readonly limits: GitLimits,
  ) {}

  /**
   * Run `git <args>` to completion.
   * @param args - git arguments; never shell-interpreted.
   * @param options - working directory, extra environment, output cap, and cancellation.
   * @returns exit facts and collected output.
   * @throws when the command times out, is aborted, or cannot spawn.
   */
  async run(args: readonly string[], options: GitRunOptions): Promise<GitRunResult> {
    const timeout = AbortSignal.timeout(this.limits.timeoutMs)
    const signal = AbortSignal.any([options.signal, timeout])
    const handle = this.subprocess.spawn({
      argv: [this.executable, ...args],
      cwd: options.cwd,
      stdio: {
        stdin: 'ignore',
        stdout: { maxBytes: options.maxBytes ?? this.limits.outputMaxBytes },
        stderr: { maxBytes: STDERR_TAIL_BYTES },
      },
      graceMs: TERMINATE_GRACE_MS,
      signal,
      // The subprocess credential scrub removes ambient GIT_CONFIG_KEY_n entries.
      env: { GIT_CONFIG_COUNT: '0', GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0', LC_ALL: 'C', ...options.env },
    })
    const outcome = await handle.done
    if (signal.aborted) {
      throw new Error(`git ${args.join(' ')} ${timeout.aborted ? `timed out after ${String(this.limits.timeoutMs)}ms` : 'was aborted'}`)
    }
    /* v8 ignore start -- collect-mode stdio always yields both readers. */
    const stdout = handle.collected.stdout?.readFrom(0) ?? { text: '', lossy: false }
    const stderr = handle.collected.stderr?.readFrom(0).text ?? ''
    /* v8 ignore stop */
    return { exitCode: outcome.exitCode, stdout: stdout.text, stderr, truncated: stdout.lossy }
  }
}
