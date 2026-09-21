/**
 * The Git workbench's asynchronous half: the calls the body performs.
 *
 * The face binds the `git` Remote namespace to one Session id, so a component
 * asks for a snapshot, a diff, a staging change, a commit, or the recent
 * history without naming the Session again. A Remote call does not reject —
 * every answer arrives as a result the caller branches on.
 */
import type { ClientRemote, RemoteResult } from '@deepseek-ai/dsh-api-remotes/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { GitCommit, GitDiff, GitStatus } from '@deepseek-ai/dsh-api-git/types'

/**
 * The slice of the Client Remote face this package calls: the `git` namespace,
 * exactly as the Host's generated client declares it.
 */
export type GitRemoteFace = Pick<ClientRemote, 'git'>

/** The calls the body performs, bound to one Session. */
export type GitInjected = {
  /** One fresh working-tree snapshot. */
  readonly refresh: () => Promise<RemoteResult<GitStatus>>
  /** The unified diff of one path, on the staged or the unstaged side. */
  readonly diff: (path: string, staged: boolean) => Promise<RemoteResult<GitDiff>>
  /** Stage paths; answers the snapshot after staging. */
  readonly stage: (paths: readonly string[]) => Promise<RemoteResult<GitStatus>>
  /** Unstage paths; answers the snapshot after unstaging. */
  readonly unstage: (paths: readonly string[]) => Promise<RemoteResult<GitStatus>>
  /** Commit the index; answers the snapshot after the commit. */
  readonly commit: (message: string) => Promise<RemoteResult<GitStatus>>
  /** The most recent commits, newest first. */
  readonly history: () => Promise<RemoteResult<readonly GitCommit[]>>
}

/** Milliseconds one panel call may take before its carrier cancels it. */
const CALL_TIMEOUT_MS = 30_000

/**
 * Bind the body's calls to one Remote face.
 * @param remote - the Client Remote face carrying the `git` namespace.
 * @returns the Slot `inject` factory: the Session id in, the bound face out.
 */
export function gitFace(remote: GitRemoteFace): (sessionId: SessionId) => GitInjected {
  return (sessionId: SessionId): GitInjected => ({
    refresh: async () => await remote.git.status(sessionId, AbortSignal.timeout(CALL_TIMEOUT_MS)),
    diff: async (path, staged) => await remote.git.diff(sessionId, path, staged, AbortSignal.timeout(CALL_TIMEOUT_MS)),
    stage: async paths => await remote.git.stage(sessionId, paths, AbortSignal.timeout(CALL_TIMEOUT_MS)),
    unstage: async paths => await remote.git.unstage(sessionId, paths, AbortSignal.timeout(CALL_TIMEOUT_MS)),
    commit: async message => await remote.git.commit(sessionId, message, AbortSignal.timeout(CALL_TIMEOUT_MS)),
    history: async () => await remote.git.history(sessionId, AbortSignal.timeout(CALL_TIMEOUT_MS)),
  })
}
