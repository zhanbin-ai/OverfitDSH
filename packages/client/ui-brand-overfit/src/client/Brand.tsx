/**
 * The 拟合 / Overfit brand marks and name for the sidebar and hero slots.
 *
 * The mark is a glossy data sphere riding the end of a rising fit curve —
 * dimensional silhouette first (a bright ball, a swept trail), with a soft
 * ground shadow, a rim light, and a specular highlight for depth. Colours are
 * the product teal family; both surfaces share one geometry, and gradient ids
 * are per-instance so two marks can coexist in one document.
 */
import { useId } from 'react'
import type { ReactNode } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SidebarBrandMarkOwnerProps, SidebarBrandNameOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { HeroBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from './locales.ts'
import css from './Brand.module.css'

/** The shared geometry: one rising fit curve and its hero sphere. */
function BrandMark({ size, className }: { size: number; className?: string | undefined }): ReactNode {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const swoosh = `bf-swoosh-${uid}`
  const ball = `bf-ball-${uid}`
  const shadow = `bf-shadow-${uid}`
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <defs>
        <linearGradient id={swoosh} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#0A5752" />
          <stop offset="1" stopColor="#4FA8A0" />
        </linearGradient>
        <radialGradient id={ball} cx="0.34" cy="0.27" r="0.95">
          <stop offset="0" stopColor="#F4FBFA" />
          <stop offset="0.45" stopColor="#6FC0B8" />
          <stop offset="1" stopColor="#0A5752" />
        </radialGradient>
        <filter id={shadow} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0.6" stdDeviation="0.6" floodColor="#063B37" floodOpacity="0.4" />
        </filter>
      </defs>
      <path
        d="M1.7 20.7C7.2 20.2 13 16.3 16.1 10.7"
        fill="none"
        stroke={`url(#${swoosh})`}
        strokeLinecap="round"
        strokeWidth="2.4"
      />
      <circle cx="15.2" cy="8.4" r="5.8" fill={`url(#${ball})`} filter={`url(#${shadow})`} />
      <path
        d="M10.3 5.6A5.6 5.6 0 0 1 14.3 2.95"
        fill="none"
        stroke="#EAF7F5"
        strokeLinecap="round"
        strokeWidth="0.9"
        opacity="0.9"
      />
      <circle cx="13.3" cy="6.3" r="1.25" fill="#fff" opacity="0.88" />
      <circle cx="9.6" cy="17.2" r="1.6" fill={`url(#${ball})`} />
      <circle cx="9.2" cy="16.6" r="0.45" fill="#fff" opacity="0.9" />
      <circle cx="4.6" cy="19.8" r="1.75" fill={`url(#${ball})`} />
      <circle cx="4.2" cy="19.2" r="0.45" fill="#fff" opacity="0.9" />
    </svg>
  )
}

/**
 * Sidebar brand mark occupant (expanded row and collapsed rail).
 * @param props - host-supplied mark geometry.
 * @returns the fit-sphere mark at the requested size.
 */
export function OverfitBrandMark({ size }: SidebarBrandMarkOwnerProps): ReactNode {
  return <BrandMark size={size} />
}

/**
 * Conversation hero brand mark occupant.
 * @param props - host-supplied mark geometry plus the host class.
 * @returns the fit-sphere mark at the requested size.
 */
export function OverfitHeroMark({ size, className }: HeroBrandMarkOwnerProps): ReactNode {
  return <BrandMark className={className} size={size} />
}

/**
 * Sidebar brand name occupant: the product name in the active language.
 * @param props - the framework-injected translate seat.
 * @returns the brand name text.
 */
export function OverfitBrandName({ t }: SidebarBrandNameOwnerProps & PropsLocale<'overfit'>): ReactNode {
  return <span className={css.name}>{t('name')}</span>
}
