/**
 * Browser half: register `git` as a right-Sidebar tab type.
 *
 * The public two-stage path: the type into `ctx.sidebarRightTabs`, the body
 * into the keyed `sidebar.right.pane.tab` seat under the type's `id`, and the
 * dictionaries into the locale registry. No host surface yet.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import { GIT_ID, gitDefinition } from './definition.tsx'
import { gitFace } from './face.ts'
import { GitBody } from './GitBody.tsx'
import { en, zh } from './locales.ts'

/** This package's copy namespace. */
const NS = 'sidebarGit'

/**
 * Required browser services: the tab registry, the keyed seat, the Remote
 * carrier and the `git` namespace, and copy.
 */
export const inject = ['slots', 'locale', 'sidebarRightTabs', 'remote', 'remote.git']

/**
 * Client plugin body: register the type, its dictionaries, and its body.
 * @param ctx - client root context carrying the registry, the slots, and locale.
 */
export function apply(ctx: ClientContext): void {
  const t = ctx.locale.bind(NS)
  ctx.effect(() => ctx.sidebarRightTabs.register(gitDefinition(t)), 'ui-git: git type')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-git: dictionaries')
  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register(
    { name: 'sidebar.right.pane.tab', key: GIT_ID, locale: NS, inject: gitFace(ctx.remote) },
    GitBody,
  )), 'ui-git: git tab body')
}
