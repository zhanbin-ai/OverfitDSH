/**
 * Product theme layer, browser half: stack the product's accent pilot over
 * the active theme through the ui-theme override seam.
 *
 * The layer holds only alias-token overrides — no DOM, no new theme id — so
 * removing the plugin restores the platform's built-in palette exactly, and
 * both light and dark palettes are covered by construction (the seam requires
 * a per-mode pair for every token). The values below are the S2 pilot accent
 * (tentative teal family); the final product palette lands with the brand
 * decision and replaces this constant.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'

/**
 * Required browser services: the theme registry that accepts the override layer.
 */
export const inject = ['theme']

/** This layer's identity in the theme override stack. */
const SOURCE = '@deepseek-ai/dsh-client-ui-product-theme'

/**
 * Pilot accent layer (S2 tentative). One teal family across the platform's
 * blue accents: the platform accent, links, info and primary buttons, the
 * conversation "business" accents, and the three blue washes (user bubble,
 * bubble highlight, active sidebar item). Every token carries both palette
 * modes; the seam rejects bare strings so a value can never go illegible
 * when the user switches color scheme. The three `--dsw-specific-*` dark
 * values repeat the platform's current neutral defaults on purpose — the
 * pilot shifts the light washes only, dark keeps its neutral wash.
 */
const PRODUCT_TOKENS = {
  '--dsw-alias-brand-primary-new-colorprimary-new-color': { light: 'rgb(13, 106, 102)', dark: 'rgb(95, 179, 172)' },
  '--dsw-alias-link': { light: 'rgb(13, 106, 102)', dark: 'rgb(95, 179, 172)' },
  '--dsw-alias-button-primary-fill': { light: 'rgb(13, 106, 102)', dark: 'rgb(95, 179, 172)' },
  '--dsw-alias-button-primary-hover': { light: 'rgb(18, 128, 122)', dark: 'rgb(82, 166, 157)' },
  '--dsw-alias-button-primary-dimmed': { light: 'rgb(217, 233, 231)', dark: 'rgb(44, 68, 65)' },
  '--dsw-alias-button-info-fill': { light: 'rgb(13, 106, 102)', dark: 'rgb(95, 179, 172)' },
  '--dsw-alias-button-info-hover': { light: 'rgb(18, 128, 122)', dark: 'rgb(82, 166, 157)' },
  '--dsw-alias-state-business-primary': { light: 'rgb(13, 106, 102)', dark: 'rgb(95, 179, 172)' },
  '--dsw-alias-state-business-tertiary': { light: 'rgb(217, 233, 231)', dark: 'rgb(44, 68, 65)' },
  '--dsw-specific-bubble': { light: 'rgb(232, 242, 240)', dark: 'rgb(44, 44, 46)' },
  '--dsw-specific-bubble-highlight': { light: 'rgb(203, 226, 223)', dark: 'rgb(67, 69, 74)' },
  '--dsw-specific-sidebar-nav-item-active-accent': { light: 'rgb(217, 233, 231)', dark: 'rgb(53, 54, 56)' },
} satisfies Record<string, { light: string; dark: string }>

/**
 * Client plugin body: stack the product token layer for this plugin's lifetime.
 * @param ctx - client root context carrying the theme registry.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.theme.overrideTokens(SOURCE, PRODUCT_TOKENS), 'ui-product-theme: product token layer')
}
