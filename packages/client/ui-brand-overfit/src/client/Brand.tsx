/**
 * The 拟合 / Overfit brand marks and name for the sidebar and hero slots.
 *
 * The mark is an orbital core: a luminous sphere held inside a tilted orbit
 * ring, with a small node riding the ring — the fit locked into orbit.
 * Sci-fi depth comes from a soft halo, a rim light, a specular highlight and
 * a glowing node; the ring palette is tuned to stay readable on both light
 * and dark surfaces, and gradient ids are per-instance so two marks can
 * coexist in one document.
 */
import { useId } from 'react'
import type { ReactNode } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SidebarBrandMarkOwnerProps, SidebarBrandNameOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { HeroBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from './locales.ts'
import css from './Brand.module.css'

/** The shared geometry: one orbital core. */
function BrandMark({ size, className }: { size: number; className?: string | undefined }): ReactNode {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const ball = `bf-ball-${uid}`
  const ring = `bf-ring-${uid}`
  const halo = `bf-halo-${uid}`
  const glow = `bf-glow-${uid}`
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
        <radialGradient id={ball} cx="0.35" cy="0.3" r="0.95">
          <stop offset="0" stopColor="#F2FFFD" />
          <stop offset="0.42" stopColor="#5AD8CE" />
          <stop offset="1" stopColor="#07353B" />
        </radialGradient>
        <linearGradient id={ring} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0B5F5C" />
          <stop offset="1" stopColor="#2FA8A0" />
        </linearGradient>
        <radialGradient id={halo} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#5AF2E4" stopOpacity="0.45" />
          <stop offset="1" stopColor="#5AF2E4" stopOpacity="0" />
        </radialGradient>
        <filter id={glow} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
      </defs>
      <circle cx="12" cy="12.2" r="10" fill={`url(#${halo})`} opacity="0.7" />
      <ellipse
        cx="12"
        cy="12.6"
        rx="10.2"
        ry="3.5"
        transform="rotate(-18 12 12.6)"
        fill="none"
        stroke={`url(#${ring})`}
        strokeWidth="1.25"
      />
      <circle cx="12" cy="12" r="4.7" fill={`url(#${ball})`} />
      <path
        d="M8.3 9.4A4.7 4.7 0 0 1 12.5 7.1"
        fill="none"
        stroke="#C9FFF8"
        strokeWidth="0.8"
        opacity="0.85"
      />
      <circle cx="10.5" cy="10.2" r="1.05" fill="#fff" opacity="0.9" />
      <circle cx="18.8" cy="7.95" r="2.5" fill="#3FD9CC" opacity="0.3" filter={`url(#${glow})`} />
      <rect
        x="17.95"
        y="7.1"
        width="1.7"
        height="1.7"
        transform="rotate(45 18.8 7.95)"
        fill="#3FD9CC"
      />
    </svg>
  )
}

/**
 * Sidebar brand mark occupant (expanded row and collapsed rail).
 * @param props - host-supplied mark geometry.
 * @returns the orbital-core mark at the requested size.
 */
export function OverfitBrandMark({ size }: SidebarBrandMarkOwnerProps): ReactNode {
  return <BrandMark size={size} />
}

/**
 * Conversation hero brand mark occupant.
 * @param props - host-supplied mark geometry plus the host class.
 * @returns the orbital-core mark at the requested size.
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
