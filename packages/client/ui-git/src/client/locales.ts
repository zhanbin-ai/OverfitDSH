/**
 * `sidebarGit` namespace dictionaries, and the namespace's declaration.
 *
 * The namespace merge lives with its key set so that any module naming
 * `TranslateNS<'sidebarGit'>` or `PropsLocale<'sidebarGit'>` needs only this
 * file, whichever entry a program loads first.
 */
import type {} from '@deepseek-ai/dsh-client-ui-slots'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Git tab type name, guide entry, and placeholder copy. */
    sidebarGit: SidebarGitKey
  }
}

/** Simplified Chinese dictionary and key-set source of truth. */
export const zh = {
  'type.label': 'Git',
  'guide.title': 'Git 工作流',
  'guide.description': '查看工作区变更、审阅差异并提交',
  'placeholder.title': 'Git 面板（建设中）',
  'placeholder.body': '这里将提供变更列表、diff 查看与提交能力；当前版本先验证插件管线。',
} satisfies Record<string, string>

/** Git dictionary key union. */
export type SidebarGitKey = keyof typeof zh

/** English dictionary, checked against the Chinese key set. */
export const en = {
  'type.label': 'Git',
  'guide.title': 'Git workflow',
  'guide.description': 'Review workspace changes and commit them',
  'placeholder.title': 'Git panel (under construction)',
  'placeholder.body': 'Change lists, diffs, and commits land here in a later milestone; this build verifies the plugin pipeline.',
} satisfies Record<SidebarGitKey, string>
