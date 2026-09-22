/**
 * The Git workbench body: a branch and snapshot header, the staged and
 * changed lists, a unified diff pane, staging actions, recent history, and a
 * commit box.
 *
 * State is component-local: the injected face functions are stateless
 * bindings, every mutating action answers with a fresh snapshot, and failures
 * land in one banner instead of toasts.
 */
import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import type { RemoteFailure, RemoteResult } from '@deepseek-ai/dsh-api-remotes/client'
import type { PropsLocale, PropsRuntime, TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { IconRefreshOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { GitChangeEntry, GitCommit, GitDiff, GitStatus } from '@deepseek-ai/dsh-api-git/types'
import type { GitInjected } from './face.ts'
import type {} from './locales.ts'
import css from './GitBody.module.css'

/** The body's composed props: the tab it draws, its bound calls, and its copy. */
export type GitBodyProps =
  & PropsRuntime<'sidebar.right.pane.tab'>
  & GitInjected
  & PropsLocale<'sidebarGit'>

/** The one-letter mark a tracked change row shows; untracked rows take the dictionary badge. */
function badgeOf(entry: GitChangeEntry): string {
  return entry.index === ' ' ? entry.worktree : entry.index
}

/** A colour family for one status letter. */
function kindOf(letter: string): string {
  switch (letter) {
    case 'A': case 'U': return css.kindAdd as string
    case 'D': return css.kindDelete as string
    case 'R': case 'C': return css.kindRename as string
    case 'M': return css.kindModify as string
    default: return css.kindOther as string
  }
}

/** One changed path row with its staging action and its diff opener. */
function ChangeRow({ entry, side, busy, onOpen, onAct, t }: {
  readonly entry: GitChangeEntry
  readonly side: 'staged' | 'changed'
  readonly busy: boolean
  readonly onOpen: () => void
  readonly onAct: () => void
  readonly t: TranslateNS<'sidebarGit'>
}): ReactNode {
  const badge = entry.untracked ? t('badge.untracked') : badgeOf(entry)
  const label = entry.from === undefined ? entry.path : `${entry.from} → ${entry.path}`
  return (
    <li className={css.row} data-git-entry={entry.path}>
      <span className={clsx(css.badge, kindOf(badge))}>{badge}</span>
      <button type="button" className={css.pathButton} title={label} onClick={onOpen}>
        {label}
      </button>
      <button type="button" className={css.action} disabled={busy} onClick={onAct}>
        {side === 'staged' ? t('panel.unstage') : t('panel.stage')}
      </button>
    </li>
  )
}

/** One unified diff, line-classified; the diff's own header lines stay quiet. */
function DiffText({ text, truncated, t }: {
  readonly text: string
  readonly truncated: boolean
  readonly t: TranslateNS<'sidebarGit'>
}): ReactNode {
  return (
    <pre className={css.diff}>
      {text.split('\n').map((line, index) => (
        <span
          key={index}
          className={clsx(
            line.startsWith('+++') || line.startsWith('---') || line.startsWith('diff ') || line.startsWith('index ')
              ? css.lineMeta
              : line.startsWith('@@')
                ? css.lineHunk
                : line.startsWith('+')
                  ? css.lineAdd
                  : line.startsWith('-')
                    ? css.lineDelete
                    : undefined,
          )}
        >{line}</span>
      ))}
      {truncated && <span className={css.lineTruncated}>{t('panel.truncated')}</span>}
    </pre>
  )
}

/**
 * The Git tab body.
 * @param props - the bound face calls and the namespace copy.
 * @returns the workbench chrome for the current Session's repository.
 */
export function GitBody({ t, refresh, diff, stage, unstage, commit, history }: GitBodyProps): ReactNode {
  const [status, setStatus] = useState<GitStatus | undefined>(undefined)
  const [failure, setFailure] = useState<RemoteFailure | undefined>(undefined)
  const [detail, setDetail] = useState<GitDiff | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [commits, setCommits] = useState<readonly GitCommit[] | undefined>(undefined)
  const [historyOpen, setHistoryOpen] = useState(false)

  const absorb = useCallback((result: RemoteResult<GitStatus>): void => {
    if (result.ok) {
      setStatus(result.value)
      setFailure(undefined)
    } else {
      setFailure(result.error)
    }
  }, [])

  const reload = useCallback(async (): Promise<void> => {
    setBusy(true)
    try {
      absorb(await refresh())
    } finally {
      setBusy(false)
    }
  }, [absorb, refresh])

  useEffect(() => {
    void reload()
  }, [reload])

  const run = useCallback(async (action: () => Promise<RemoteResult<GitStatus>>): Promise<void> => {
    setBusy(true)
    try {
      absorb(await action())
    } finally {
      setBusy(false)
    }
  }, [absorb])

  const openDiff = useCallback(async (path: string, staged: boolean): Promise<void> => {
    setBusy(true)
    try {
      const result = await diff(path, staged)
      if (result.ok) {
        setDetail(result.value)
        setFailure(undefined)
      } else {
        setFailure(result.error)
      }
    } finally {
      setBusy(false)
    }
  }, [diff])

  const onCommit = useCallback(async (): Promise<void> => {
    setBusy(true)
    try {
      const result = await commit(message)
      if (result.ok) {
        setStatus(result.value)
        setFailure(undefined)
        setMessage('')
      } else {
        setFailure(result.error)
      }
    } finally {
      setBusy(false)
    }
  }, [commit, message])

  const toggleHistory = useCallback(async (): Promise<void> => {
    const next = !historyOpen
    setHistoryOpen(next)
    if (next && commits === undefined) {
      const result = await history()
      if (result.ok) setCommits(result.value)
      else setFailure(result.error)
    }
  }, [commits, history, historyOpen])

  const entries = status?.entries ?? []
  const staged = entries.filter(entry => !entry.untracked && entry.index !== ' ' && entry.index !== '?')
  const changed = entries.filter(entry => entry.untracked || entry.worktree !== ' ')

  return (
    <div className={css.root} data-git-panel>
      <header className={css.header}>
        <span className={css.branch} title={status?.repoRoot ?? ''}>
          {status === undefined ? t('panel.loading') : status.branch ?? t('panel.detached')}
        </span>
        <span className={css.spacer} />
        <button type="button" className={css.textButton} disabled={busy} onClick={() => { void toggleHistory() }}>
          {t('panel.history')}
        </button>
        <button
          type="button"
          className={css.iconButton}
          aria-label={t('panel.refresh')}
          title={t('panel.refresh')}
          disabled={busy}
          onClick={() => { void reload() }}
        >
          <IconRefreshOutline16 size={14} />
        </button>
      </header>
      {status !== undefined && <div className={css.repoPath} title={status.repoRoot}>{status.repoRoot}</div>}
      {failure !== undefined && (
        <div className={css.banner}>{t('panel.error', { message: failure.message })}</div>
      )}

      {detail !== undefined
        ? (
          <section className={css.diffPane} data-git-diff={detail.path}>
            <div className={css.diffHeader}>
              <button type="button" className={css.textButton} onClick={() => { setDetail(undefined) }}>
                {t('panel.back')}
              </button>
              <span className={css.diffPath} title={detail.path}>{detail.path}</span>
              {detail.staged && <span className={css.stagedTag}>{t('panel.stagedTag')}</span>}
            </div>
            {detail.text.trim() === ''
              ? <p className={css.empty}>{t('panel.diffEmpty')}</p>
              : <DiffText text={detail.text} truncated={detail.truncated} t={t} />}
          </section>
        )
        : (
          <div className={css.lists}>
            {status === undefined && busy && <p className={css.empty}>{t('panel.loading')}</p>}
            {status !== undefined && entries.length === 0 && <p className={css.empty}>{t('panel.clean')}</p>}
            {staged.length > 0 && (
              <section className={css.section} data-git-group="staged">
                <div className={css.sectionTitle}>
                  <span>{t('panel.staged')}</span>
                  <span className={css.count}>{staged.length}</span>
                </div>
                <ul className={css.list}>
                  {staged.map(entry => (
                    <ChangeRow
                      key={`s:${entry.path}`}
                      entry={entry}
                      side="staged"
                      busy={busy}
                      t={t}
                      onOpen={() => { void openDiff(entry.path, true) }}
                      onAct={() => { void run(async () => await unstage([entry.path])) }}
                    />
                  ))}
                </ul>
              </section>
            )}
            {changed.length > 0 && (
              <section className={css.section} data-git-group="changed">
                <div className={css.sectionTitle}>
                  <span>{t('panel.changes')}</span>
                  <span className={css.count}>{changed.length}</span>
                  <span className={css.spacer} />
                  <button
                    type="button"
                    className={css.textButton}
                    disabled={busy}
                    onClick={() => { void run(async () => await stage(changed.map(entry => entry.path))) }}
                  >
                    {t('panel.stageAll')}
                  </button>
                </div>
                <ul className={css.list}>
                  {changed.map(entry => (
                    <ChangeRow
                      key={`c:${entry.path}`}
                      entry={entry}
                      side="changed"
                      busy={busy}
                      t={t}
                      onOpen={() => { void openDiff(entry.path, false) }}
                      onAct={() => { void run(async () => await stage([entry.path])) }}
                    />
                  ))}
                </ul>
              </section>
            )}
            {historyOpen && (
              <section className={css.section} data-git-group="history">
                <div className={css.sectionTitle}><span>{t('panel.history')}</span></div>
                {commits === undefined
                  ? <p className={css.empty}>{t('panel.loading')}</p>
                  : commits.length === 0
                    ? <p className={css.empty}>{t('panel.historyEmpty')}</p>
                    : (
                      <ul className={css.list}>
                        {commits.map(item => (
                          <li key={item.hash} className={css.commitRow}>
                            <code className={css.hash}>{item.hash}</code>
                            <span className={css.commitSubject} title={item.subject}>{item.subject}</span>
                          </li>
                        ))}
                      </ul>
                    )}
              </section>
            )}
          </div>
        )}

      <footer className={css.footer}>
        <textarea
          className={css.message}
          placeholder={t('panel.commitPlaceholder')}
          rows={3}
          value={message}
          onChange={(event) => { setMessage(event.target.value) }}
        />
        <div className={css.footerRow}>
          <span className={css.muted}>
            {staged.length === 0 ? t('panel.commitNone') : t('panel.commitCount', { count: staged.length })}
          </span>
          <button
            type="button"
            className={css.submit}
            disabled={busy || message.trim() === '' || staged.length === 0}
            onClick={() => { void onCommit() }}
          >
            {t('panel.commitAction')}
          </button>
        </div>
      </footer>
    </div>
  )
}
