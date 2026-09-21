/**
 * Browser half: mounts the Ctrl+K command palette into `shell.overlay`.
 *
 * The palette is one additive occupant of ui-layout's overlay list; it opens
 * on Ctrl+K (⌘K on macOS) and executes through the same client services every
 * other surface uses — navigation goes through `uiWorkspace`, appearance
 * through the theme service, the Git tab through the right-sidebar registry,
 * and settings through its own trigger (its open state is component-local).
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-api-workspace-controller/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import { CommandPalette } from './Palette.tsx'
import type { CommandPaletteInjected } from './Palette.tsx'
import type { PaletteEnv } from './entries.ts'
import { openSettingsPanel } from './entries.ts'
import { en, zh } from './locales.ts'

/** This package's copy namespace. */
const NS = 'commandPalette'

/** The overlay seat id (list slots key additive seats by id). */
const ID = '@deepseek-ai/dsh-client-ui-command-palette'

/** The Git workbench tab type ui-git registers. */
const GIT_TAB_ID = '@deepseek-ai/dsh-client-ui-git'

/** Required browser services: the overlay ledger, navigation, appearance, and the right pane. */
export const inject = ['slots', 'locale', 'sessions', 'workspaces', 'uiWorkspace', 'theme', 'sidebarRight']

/**
 * Client plugin body: register the dictionaries and the overlay occupant.
 * @param ctx - client root context carrying the services the palette drives.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-command-palette: dictionaries')
  const env: PaletteEnv = {
    sessions: ctx.sessions,
    workspaces: ctx.workspaces,
    uiWorkspace: ctx.uiWorkspace,
    setTheme: (id) => { ctx.theme.setTheme(id) },
    openGitTab: () => {
      try {
        ctx.sidebarRight.openTab(GIT_TAB_ID)
      } catch (error) {
        console.warn('[command-palette] opening the Git tab failed:', error)
      }
    },
    openSettings: openSettingsPanel,
  }
  ctx.effect(() => ctx.slots.inject('shell.overlay', () => ctx.slots.register(
    {
      name: 'shell.overlay',
      id: ID,
      locale: NS,
      inject: (): CommandPaletteInjected => ({ env }),
    },
    CommandPalette,
  )), 'ui-command-palette: overlay entry')
}
