/**
 * Browser half: the 拟合 / Overfit brand occupants for the sidebar brand row
 * and the conversation hero mark.
 *
 * Occupancy is the composition path (per `ui-brand-official`'s replacement
 * guidance): an own-brand deployment mounts this package instead of the
 * official one and occupies the same slots — there is no brand configuration
 * surface. The three registrations install and roll back as one declaration-
 * aware set; the hero mark slot waits on ui-conversation's declaration like
 * the sidebar pair waits on ui-sidebar's.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { OverfitBrandMark, OverfitBrandName, OverfitHeroMark } from './Brand.tsx'
import { en, zh } from './locales.ts'

/** This package's copy namespace. */
const NS = 'overfit'

/** Required browser services: the slot registry and copy. */
export const inject = ['slots', 'locale']

/**
 * Client plugin body: register the name dictionaries and the brand occupants.
 * @param ctx - client root context carrying the registry and locale.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-brand-overfit: dictionaries')
  ctx.effect(() => ctx.slots.inject('sidebar.brand.mark', () =>
    ctx.slots.inject('sidebar.brand.name', () =>
      ctx.slots.inject('conversation.hero.brand.mark', function* () {
        yield ctx.slots.register({ name: 'sidebar.brand.mark' }, OverfitBrandMark)
        yield ctx.slots.register({ name: 'sidebar.brand.name', locale: NS }, OverfitBrandName)
        yield ctx.slots.register({ name: 'conversation.hero.brand.mark' }, OverfitHeroMark)
      }))), 'ui-brand-overfit: brand occupants')
}
