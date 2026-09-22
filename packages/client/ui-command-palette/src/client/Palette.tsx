/**
 * The command palette shell: one Ctrl+K (⌘K on macOS) overlay over the whole
 * app. The search input keeps focus while open — ↑↓ move a virtual highlight,
 * Enter runs the row, Escape or a click on the mask closes. Closed state
 * renders null; the overlay slot stays mounted.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import clsx from 'clsx'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { PaletteEntry, PaletteEnv } from './entries.ts'
import { buildEntries, filterEntries } from './entries.ts'
import type {} from './locales.ts'
import css from './Palette.module.css'

/** The injected face: the client services the palette drives. */
export interface CommandPaletteInjected {
  readonly env: PaletteEnv
}

/** Full shell props: the injected environment plus the locale seat. */
export type CommandPaletteProps =
  & PropsRuntime<'shell.overlay'>
  & PropsLocale<'commandPalette'>
  & InjectFace<CommandPaletteInjected>

/** Section heading copy for one section kind. */
const SECTION_LABEL = {
  session: 'section.sessions',
  workspace: 'section.workspaces',
  command: 'section.commands',
} as const

/**
 * Render the command palette overlay entry.
 * @param props - injected environment (client services) and `t` seat.
 * @returns the palette while open; null while closed.
 */
export function CommandPalette({ env, t }: CommandPaletteProps): ReactNode {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [entries, setEntries] = useState<readonly PaletteEntry[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const openPalette = useCallback(() => {
    setEntries(buildEntries(env, {
      blankSession: t('blankSession'),
      newSession: t('command.newSession'),
      openGit: t('command.openGit'),
      openSettings: t('command.openSettings'),
      themeLight: t('command.themeLight'),
      themeDark: t('command.themeDark'),
      themeSystem: t('command.themeSystem'),
    }))
    setQuery('')
    setActive(0)
    setOpen(true)
  }, [env, t])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActive(0)
  }, [])

  // The global hotkey: capture phase, modifier exact, never on autorepeat.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!(event.ctrlKey || event.metaKey) || event.shiftKey || event.altKey) return
      if (event.key.toLowerCase() !== 'k') return
      event.preventDefault()
      if (open) close()
      else openPalette()
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => { document.removeEventListener('keydown', onKeyDown, true) }
  }, [close, open, openPalette])

  // The search input takes focus right after it mounts.
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const filtered = useMemo(() => filterEntries(entries, query), [entries, query])
  const clamped = filtered.length === 0 ? 0 : Math.min(active, filtered.length - 1)

  // The input keeps focus while arrows move a virtual highlight, so the
  // browser never scrolls the active row into view — do it here.
  useEffect(() => {
    if (!open) return
    document.querySelector('[data-command-palette] [aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [clamped, open, query])

  const run = useCallback((entry: PaletteEntry | undefined): void => {
    if (entry === undefined) return
    close()
    try {
      entry.run()
    } catch (error) {
      console.warn('[command-palette] entry failed:', error)
    }
  }, [close])

  const onInputKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActive(filtered.length === 0 ? 0 : (clamped + 1) % filtered.length)
        return
      case 'ArrowUp':
        event.preventDefault()
        setActive(filtered.length === 0 ? 0 : (clamped - 1 + filtered.length) % filtered.length)
        return
      case 'Enter':
        event.preventDefault()
        run(filtered[clamped])
        return
      case 'Escape':
        event.preventDefault()
        close()
        return
      default:
        return
    }
  }, [clamped, close, filtered, run])

  if (!open) return null

  const groups: { section: PaletteEntry['section']; items: { entry: PaletteEntry; flat: number }[] }[] = []
  filtered.forEach((entry, flat) => {
    const group = groups.find(candidate => candidate.section === entry.section)
    if (group === undefined) groups.push({ section: entry.section, items: [{ entry, flat }] })
    else group.items.push({ entry, flat })
  })

  return (
    <div className={css.root} data-command-palette>
      <div className={css.mask} aria-hidden="true" onClick={close} />
      <div className={css.card} role="dialog" aria-modal="true" aria-label={t('ariaLabel')}>
        <div className={css.searchRow}>
          <input
            ref={inputRef}
            className={css.search}
            placeholder={t('placeholder')}
            value={query}
            onChange={(event) => { setQuery(event.target.value); setActive(0) }}
            onKeyDown={onInputKeyDown}
          />
          <span className={css.escHint}>{t('escapeHint')}</span>
        </div>
        <div className={css.list} role="listbox">
          {filtered.length === 0 && <div className={css.empty}>{t('empty')}</div>}
          {groups.map(group => (
            <div key={group.section} className={css.group}>
              <div className={css.sectionLabel}>{t(SECTION_LABEL[group.section])}</div>
              {group.items.map(({ entry, flat }) => (
                <button
                  key={entry.id}
                  type="button"
                  role="option"
                  aria-selected={flat === clamped}
                  className={clsx(css.row, flat === clamped && css.rowActive)}
                  onMouseEnter={() => { setActive(flat) }}
                  onClick={() => { run(entry) }}
                >
                  <span className={css.rowLabel}>{entry.label}</span>
                  {entry.hint !== undefined && <span className={css.rowHint}>{entry.hint}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
