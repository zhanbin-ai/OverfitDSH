/**
 * The git tab's body: a placeholder that names what lands here next.
 *
 * Product-visible copy goes through the locale namespace; the pane chrome
 * supplies width and scrolling, so the body only centers its copy.
 */
import type { ReactNode } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from './locales.ts'
import css from './GitBody.module.css'

/** The body's composed props: the tab it draws and its copy. */
export type GitBodyProps =
  & PropsRuntime<'sidebar.right.pane.tab'>
  & PropsLocale<'sidebarGit'>

/**
 * The placeholder body.
 * @param props - runtime seat plus the locale share.
 * @returns the centered title and hint.
 */
export function GitBody({ t }: GitBodyProps): ReactNode {
  return (
    <div className={css.root}>
      <div className={css.card}>
        <div className={css.title}>{t('placeholder.title')}</div>
        <p className={css.body}>{t('placeholder.body')}</p>
      </div>
    </div>
  )
}
