/**
 * `overfit` namespace dictionaries, and the namespace's declaration.
 *
 * The namespace merge lives with its key set so that any module naming
 * `TranslateNS<'overfit'>` or `PropsLocale<'overfit'>` needs only this file,
 * whichever entry a program loads first.
 */
import type {} from '@deepseek-ai/dsh-client-ui-slots'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Own-brand display name (sidebar brand row). */
    overfit: OverfitKey
  }
}

/** Simplified Chinese dictionary and key-set source of truth. */
export const zh = {
  'name': '拟合',
} satisfies Record<string, string>

/** Overfit dictionary key union. */
export type OverfitKey = keyof typeof zh

/** English dictionary, checked against the Chinese key set. */
export const en = {
  'name': 'Overfit',
} satisfies Record<OverfitKey, string>
