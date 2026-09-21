/**
 * The 拟合 / Overfit brand marks and name for the sidebar and hero slots.
 *
 * The mark is a smooth fit through three sample points — the literal gesture
 * of 拟合 / fitting — drawn as plain SVG in `currentColor`, so every surface
 * themes it without a second asset. The hero mark keeps the host's `className`
 * so the surrounding geometry (and its gentle hover sway) stays intact.
 */
import type { ReactNode } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SidebarBrandMarkOwnerProps, SidebarBrandNameOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { HeroBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from './locales.ts'
import css from './Brand.module.css'

/** One smooth curve through three samples; the shared geometry of the brand. */
function CurveMark({ size, className }: { size: number; className?: string | undefined }): ReactNode {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d="M3.4 19.2C9 18.5 13.4 14.2 20.6 5.4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <circle cx="5.1" cy="18.9" r="2.05" fill="currentColor" />
      <circle cx="10.4" cy="16.1" r="2.05" fill="currentColor" />
      <circle cx="16.2" cy="10.6" r="2.05" fill="currentColor" />
    </svg>
  )
}

/**
 * Sidebar brand mark occupant (expanded row and collapsed rail).
 * @param props - host-supplied mark geometry.
 * @returns the curve mark at the requested size.
 */
export function OverfitBrandMark({ size }: SidebarBrandMarkOwnerProps): ReactNode {
  return <CurveMark size={size} />
}

/**
 * Conversation hero brand mark occupant.
 * @param props - host-supplied mark geometry plus the host class.
 * @returns the curve mark at the requested size.
 */
export function OverfitHeroMark({ size, className }: HeroBrandMarkOwnerProps): ReactNode {
  return <CurveMark className={className} size={size} />
}

/**
 * Sidebar brand name occupant: the product name in the active language.
 * @param props - the framework-injected translate seat.
 * @returns the brand name text.
 */
export function OverfitBrandName({ t }: SidebarBrandNameOwnerProps & PropsLocale<'overfit'>): ReactNode {
  return <span className={css.name}>{t('name')}</span>
}
