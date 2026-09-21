/**
 * Palette data: the searchable entries, the pure ranking, and the one DOM
 * affordance the palette cannot reach through a service.
 *
 * Entries are built fresh every time the palette opens, from the same client
 * services every other surface reads: the Session list, the Workspace list,
 * and a small built-in command set (new session, Git panel, settings,
 * appearance). Execution stays with those services — the palette only names
 * them.
 */
import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { WorkspaceId, WorkspaceView } from '@deepseek-ai/dsh-api-workspace-controller/client'

/** Palette section identity; also the display order. */
export type PaletteSection = 'session' | 'workspace' | 'command'

/** One runnable palette row. */
export interface PaletteEntry {
  readonly id: string
  readonly section: PaletteSection
  readonly label: string
  /** Secondary text: workspace title for a session, path for a workspace. */
  readonly hint?: string
  /** Extra search material that never displays. */
  readonly keywords?: string
  readonly run: () => void
}

/** The copy the entry builder needs (the shell supplies it from `t`). */
export interface PaletteLabels {
  readonly blankSession: string
  readonly newSession: string
  readonly openGit: string
  readonly openSettings: string
  readonly themeLight: string
  readonly themeDark: string
  readonly themeSystem: string
}

/** The minimal service surface the palette drives. */
export interface PaletteEnv {
  readonly sessions: { readonly list: { getSnapshot: () => SessionListState } }
  readonly workspaces: { readonly list: { getSnapshot: () => { readonly items: readonly WorkspaceView[] } } }
  readonly uiWorkspace: {
    readonly openSession: (target: SessionId) => void
    readonly openWorkspace: (workspaceId: WorkspaceId) => void
    readonly startSession: () => void
  }
  readonly setTheme: (id: 'light' | 'dark' | 'system') => void
  readonly openGitTab: () => void
  readonly openSettings: () => void
}

/** Row shape the Session controller projects for list consumers. */
type SessionRow = SessionListState['byId'][SessionId] & {
  readonly displayTitle?: string
}

/** Most sessions one palette page lists. */
const SESSION_LIMIT = 25

/**
 * Build the palette's entries from live client state.
 * @param env - the service surface.
 * @param labels - localized command labels.
 * @returns sessions (recent first), workspaces, then commands.
 */
export function buildEntries(env: PaletteEnv, labels: PaletteLabels): PaletteEntry[] {
  const entries: PaletteEntry[] = []
  const workspaceList = env.workspaces.list.getSnapshot().items
  const workspaceOf = new Map<string, WorkspaceView>()
  for (const workspace of workspaceList) {
    for (const sessionId of workspace.sessionIds) workspaceOf.set(sessionId, workspace)
  }

  const list = env.sessions.list.getSnapshot()
  const sessions = list.ids
    .map(id => ({ id, row: list.byId[id] as SessionRow | undefined }))
    .filter((item): item is { id: SessionId; row: SessionRow } => item.row !== undefined)
    .sort((left, right) => right.row.updatedAt - left.row.updatedAt)
    .slice(0, SESSION_LIMIT)
  for (const { id, row } of sessions) {
    const label = row.blank === true || row.displayTitle === undefined || row.displayTitle === ''
      ? labels.blankSession
      : row.displayTitle
    const workspace = workspaceOf.get(id)
    entries.push({
      id: `session:${id}`,
      section: 'session',
      label,
      ...(workspace !== undefined ? { hint: workspace.title } : {}),
      ...(row.cwd !== undefined ? { keywords: row.cwd } : {}),
      run: () => { env.uiWorkspace.openSession(id) },
    })
  }

  for (const workspace of workspaceList) {
    entries.push({
      id: `workspace:${workspace.workspaceId}`,
      section: 'workspace',
      label: workspace.title,
      hint: workspace.path,
      run: () => { void env.uiWorkspace.openWorkspace(workspace.workspaceId) },
    })
  }

  entries.push(
    {
      id: 'command:new-session',
      section: 'command',
      label: labels.newSession,
      keywords: 'new session start',
      run: () => { env.uiWorkspace.startSession() },
    },
    {
      id: 'command:open-git',
      section: 'command',
      label: labels.openGit,
      keywords: 'git diff commit stage',
      run: () => { env.openGitTab() },
    },
    {
      id: 'command:open-settings',
      section: 'command',
      label: labels.openSettings,
      keywords: 'settings preferences',
      run: () => { env.openSettings() },
    },
    {
      id: 'command:theme-light',
      section: 'command',
      label: labels.themeLight,
      keywords: 'theme light appearance',
      run: () => { env.setTheme('light') },
    },
    {
      id: 'command:theme-dark',
      section: 'command',
      label: labels.themeDark,
      keywords: 'theme dark appearance',
      run: () => { env.setTheme('dark') },
    },
    {
      id: 'command:theme-system',
      section: 'command',
      label: labels.themeSystem,
      keywords: 'theme system appearance auto',
      run: () => { env.setTheme('system') },
    },
  )
  return entries
}

/**
 * Rank entries for one query: case-insensitive substring over label, hint,
 * keywords, and id; label prefix beats label hit beats payload hit; ties keep
 * build order (sessions stay recent-first).
 * @param entries - built entries.
 * @param query - raw search text.
 * @returns filtered entries in display order.
 */
export function filterEntries(entries: readonly PaletteEntry[], query: string): PaletteEntry[] {
  const needle = query.trim().toLowerCase()
  if (needle === '') return [...entries]
  const scored: { entry: PaletteEntry; score: number; rank: number }[] = []
  entries.forEach((entry, rank) => {
    const label = entry.label.toLowerCase()
    const haystack = `${label}\n${(entry.hint ?? '').toLowerCase()}\n${(entry.keywords ?? '').toLowerCase()}\n${entry.id}`
    if (!haystack.includes(needle)) return
    const score = label.startsWith(needle) ? 3 : label.includes(needle) ? 2 : 1
    scored.push({ entry, score, rank })
  })
  scored.sort((left, right) => right.score - left.score || left.rank - right.rank)
  return scored.map(item => item.entry)
}

/**
 * Open the Settings panel through its sidebar trigger: the panel's open state
 * is component-local (the settings shell owns it), so the public affordance
 * is the trigger button itself. A missing trigger is a no-op.
 */
export function openSettingsPanel(): void {
  document.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"][aria-expanded]')?.click()
}
