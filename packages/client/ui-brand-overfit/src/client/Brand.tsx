/**
 * The 拟合 / Overfit brand marks and name for the sidebar and hero slots.
 *
 * The mark is an orbital core: a luminous sphere held inside a tilted orbit
 * band that crosses in front of the sphere — the fit locked into orbit. The
 * band is softly tapered (thick at the near side, thin at the far side) with
 * blurred edges, so the mark reads as a physical object rather than a crisp
 * wireframe; a soft halo, a rim light, a specular highlight and a small
 * diamond node carry the depth. Gradient and clip ids are per-instance so two
 * marks can coexist in one document.
 */
import { useId } from 'react'
import type { ReactNode } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { SidebarBrandMarkOwnerProps, SidebarBrandNameOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { HeroBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from './locales.ts'
import css from './Brand.module.css'

/** One closed tapered band: the outer ellipse minus a lifted inner ellipse. */
const BAND = 'M1.8 12.6A10.2 3.7 0 1 1 22.2 12.6A10.2 3.7 0 1 1 1.8 12.6Z'
  + ' M2.6 12.15A9.4 2.75 0 1 0 21.4 12.15A9.4 2.75 0 1 0 2.6 12.15Z'

/** The shared geometry: one orbital core. */
function BrandMark({ size, className }: { size: number; className?: string | undefined }): ReactNode {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const ball = `bf-ball-${uid}`
  const ring = `bf-ring-${uid}`
  const halo = `bf-halo-${uid}`
  const glow = `bf-glow-${uid}`
  const soft = `bf-soft-${uid}`
  const front = `bf-front-${uid}`
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
          <stop offset="0" stopColor="#0C6663" />
          <stop offset="1" stopColor="#2A9E96" />
        </linearGradient>
        <radialGradient id={halo} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#5AF2E4" stopOpacity="0.45" />
          <stop offset="1" stopColor="#5AF2E4" stopOpacity="0" />
        </radialGradient>
        <filter id={glow} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
        <filter id={soft} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.16" />
        </filter>
        <clipPath id={front}>
          <rect x="-12" y="0.85" width="24" height="7" transform="translate(12 12.6) rotate(-18)" />
        </clipPath>
      </defs>
      <circle cx="12" cy="12.2" r="9.6" fill={`url(#${halo})`} opacity="0.55" />
      <g transform="rotate(-18 12 12.6)">
        <path d={BAND} fill={`url(#${ring})`} fillRule="evenodd" filter={`url(#${soft})`} />
      </g>
      <circle cx="12" cy="12.05" r="4.8" fill={`url(#${ball})`} />
      <path
        d="M7.3 9.36A4.8 4.8 0 0 1 12.4 6.96"
        fill="none"
        stroke="#C9FFF8"
        strokeWidth="0.7"
        opacity="0.7"
      />
      <circle cx="10.5" cy="10.2" r="1.1" fill="#fff" opacity="0.85" />
      <g transform="rotate(-18 12 12.6)" clipPath={`url(#${front})`}>
        <path d={BAND} fill={`url(#${ring})`} fillRule="evenodd" filter={`url(#${soft})`} />
      </g>
      <circle cx="18.7" cy="7.95" r="2.3" fill="#35CDBF" opacity="0.25" filter={`url(#${glow})`} />
      <rect
        x="17.925"
        y="7.175"
        width="1.55"
        height="1.55"
        transform="rotate(45 18.7 7.95)"
        fill="#35CDBF"
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
 * Sidebar brand name occupant: the bilingual lockup — the product name in the
 * active language with its counterpart script beside it.
 * @param props - the framework-injected translate seat.
 * @returns the brand name and its counterpart text.
 */
export function OverfitBrandName({ t }: SidebarBrandNameOwnerProps & PropsLocale<'overfit'>): ReactNode {
  return (
    <>
      <span className={css.name}>{t('name')}</span>
      <span className={css.nameSecondary}>{t('nameSecondary')}</span>
    </>
  )
}
