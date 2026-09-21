/**
 * Stage one of this package's registration: what the `git` tab type IS.
 *
 * The type is a page, not a viewer: it claims no address. The guide page offers
 * it as an entry box, and the body mounts on demand.
 */
import type { SidebarRightTabDefinition } from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-locale/client'
import type { IconProps } from '@deepseek-ai/dsh-client-ui-primitives'
import type {} from './locales.ts'

/** The tab kind this package owns. */
export const GIT_KIND = 'git'

/** This implementation's identity in the tab system, and the key its body registers under. */
export const GIT_ID = '@deepseek-ai/dsh-client-ui-git'

/** A branch glyph at the guide capsule's glyph size, drawn on currentColor. */
function GitBranchGlyph({ size, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="4.5" cy="3.5" r="1.7" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="4.5" cy="12.5" r="1.7" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="11.5" cy="5.5" r="1.7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4.5 5.2v5.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11.5 7.2v.6c0 2.1-1.7 3.5-4.3 3.9" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

/**
 * The git type's registry definition.
 * @param t - namespace-bound translate, read fresh on every label call.
 * @returns the definition to register.
 */
export function gitDefinition(t: TranslateNS<'sidebarGit'>): SidebarRightTabDefinition {
  return {
    id: GIT_ID,
    kind: GIT_KIND,
    priority: 'builtin',
    title: () => t('type.label'),
    guide: [{
      id: 'git',
      order: 20,
      title: () => t('guide.title'),
      description: () => t('guide.description'),
      icon: GitBranchGlyph,
    }],
  }
}
