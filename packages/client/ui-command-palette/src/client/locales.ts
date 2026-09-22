/**
 * `commandPalette` namespace dictionaries, and the namespace's declaration.
 *
 * The namespace merge lives with its key set so that any module naming
 * `TranslateNS<'commandPalette'>` or `PropsLocale<'commandPalette'>` needs
 * only this file, whichever entry a program loads first.
 */
import type {} from '@deepseek-ai/dsh-client-ui-slots'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Command palette shell copy. */
    commandPalette: CommandPaletteKey
  }
}

/** Simplified Chinese dictionary and key-set source of truth. */
export const zh = {
  'ariaLabel': '命令面板',
  'placeholder': '搜索会话、工作区与命令…',
  'empty': '没有匹配的结果',
  'escapeHint': 'Esc',
  'section.sessions': '会话',
  'section.workspaces': '工作区',
  'section.commands': '命令',
  'blankSession': '新会话',
  'command.newSession': '新建会话',
  'command.openGit': '打开 Git 面板',
  'command.openSettings': '打开设置',
  'command.themeLight': '外观：浅色',
  'command.themeDark': '外观：深色',
  'command.themeSystem': '外观：跟随系统',
} satisfies Record<string, string>

/** Command palette dictionary key union. */
export type CommandPaletteKey = keyof typeof zh

/** English dictionary, checked against the Chinese key set. */
export const en = {
  'ariaLabel': 'Command palette',
  'placeholder': 'Search sessions, workspaces, and commands…',
  'empty': 'No matching results',
  'escapeHint': 'Esc',
  'section.sessions': 'Sessions',
  'section.workspaces': 'Workspaces',
  'section.commands': 'Commands',
  'blankSession': 'New session',
  'command.newSession': 'New session',
  'command.openGit': 'Open Git panel',
  'command.openSettings': 'Open settings',
  'command.themeLight': 'Appearance: Light',
  'command.themeDark': 'Appearance: Dark',
  'command.themeSystem': 'Appearance: Follow system',
} satisfies Record<CommandPaletteKey, string>
