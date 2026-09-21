/**
 * Wire payloads and failure codes of the `git` Remote namespace.
 *
 * Published as the `./types` export, this module is the client-safe
 * vocabulary: a UI package names these shapes without importing the Host
 * service, and the failure codes are declared here because this package is
 * their only producer.
 */
import type {} from '@deepseek-ai/dsh-typert-protocol'

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    /** The Session workspace is not inside a git repository. */
    'git/not-repository': { readonly workspaceRoot: string }
    /** A git command exited nonzero for a reason the endpoint does not classify further. */
    'git/command-failed': { readonly command: string; readonly stderr: string }
  }
}

/** One changed path as `git status` reports it. */
export interface GitChangeEntry {
  /** Repo-root-relative slash path (the new path for a rename). */
  readonly path: string
  /** Original path of a rename or copy, repo-root-relative. */
  readonly from?: string
  /** Index (staged) status letter; `' '` when the index matches HEAD there. */
  readonly index: string
  /** Work-tree status letter; `' '` when the work tree matches the index there. */
  readonly worktree: string
  /** Whether the path is untracked. */
  readonly untracked: boolean
}

/** One working-tree snapshot of the Session's repository. */
export interface GitStatus {
  /** Repository top-level directory every reported path is relative to. */
  readonly repoRoot: string
  /** Current branch name, or null on a detached or unborn HEAD. */
  readonly branch: string | null
  /** Changed paths in git's own order. */
  readonly entries: readonly GitChangeEntry[]
}

/** One unified diff of a single path. */
export interface GitDiff {
  /** The path the diff was computed for. */
  readonly path: string
  /** Whether this is the staged (index vs HEAD) side. */
  readonly staged: boolean
  /** Unified diff text; for an untracked file, a `/dev/null`-based addition. */
  readonly text: string
  /** Whether the text hit the configured cap and was cut. */
  readonly truncated: boolean
}

/** One recent commit. */
export interface GitCommit {
  /** Abbreviated hash. */
  readonly hash: string
  /** First line of the commit message. */
  readonly subject: string
}
