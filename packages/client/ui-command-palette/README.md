---
description: "Ctrl+K command palette for the Web client: one shell overlay that searches sessions, workspaces, and built-in app commands."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-command-palette

English | [中文](README.zh.md)

## Summary

Press Ctrl+K (⌘K on macOS) anywhere for one overlay that finds and runs what you need: recent sessions (switch), workspaces (open), and built-in commands — new session, open the Git panel, open settings, and appearance switches (light / dark / follow system). The search input keeps focus while open: ↑↓ move the highlight, Enter runs the row, Escape or a click outside closes it.

## Use this package

Mount the package; the overlay registers itself into `shell.overlay` and installs the global hotkey. Entries are built from live client state every time the palette opens, and execution goes through the same services every other surface uses.

| Entry group | Source | Action |
|---|---|---|
| Sessions (recent first, 25 max) | Session list (`ctx.sessions`) | `ctx.uiWorkspace.openSession` |
| Workspaces | Workspace list (`ctx.workspaces`) | `ctx.uiWorkspace.openWorkspace` |
| Commands | Built-in set | `startSession` / right-pane `openTab` / `theme.setTheme` / settings trigger |

## Understand the implementation

`entries.ts` is pure: `buildEntries` projects client snapshots into rows, `filterEntries` ranks case-insensitive substring hits (label prefix beats label hit beats payload hit; ties keep build order). `Palette.tsx` owns viewing state only — the open flag, the query, the highlight — and never writes business state. Settings keeps one deliberate DOM call (`openSettingsPanel`): the panel's open state is component-local to the settings shell, so its public affordance is the trigger button; a missing trigger is a no-op.

## Known limitations and deferred work

- **Built-ins only** — no plugin-contributed command registry yet.
- **No usage history** — no recency/frequency ranking; sessions are recent-first by build order.
- **Settings opens at its last section** — deep-linking one section is deferred.
- **Substring matching only** — no subsequence fuzziness (CJK-friendly as-is).

**Runtime note:** no companion entry; the occupant installs and releases through one transactional effect.
