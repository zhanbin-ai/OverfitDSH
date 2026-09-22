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
  'panel.detached': '（游离 HEAD）',
  'panel.refresh': '刷新',
  'panel.history': '历史',
  'panel.staged': '已暂存',
  'panel.changes': '变更',
  'panel.stage': '暂存',
  'panel.unstage': '取消暂存',
  'panel.stageAll': '全部暂存',
  'panel.back': '← 返回',
  'panel.stagedTag': '暂存区',
  'badge.untracked': 'U',
  'panel.loading': '正在读取…',
  'panel.clean': '工作区干净，没有待处理的变更。',
  'panel.diffEmpty': '没有可显示的差异。',
  'panel.truncated': '… 差异过长，已截断显示。',
  'panel.commitPlaceholder': '提交信息',
  'panel.commitAction': '提交',
  'panel.commitCount': '已暂存 {count} 项',
  'panel.commitNone': '先暂存要提交的文件',
  'panel.historyEmpty': '还没有提交。',
  'panel.error': '操作失败：{message}',
} satisfies Record<string, string>

/** Git dictionary key union. */
export type SidebarGitKey = keyof typeof zh

/** English dictionary, checked against the Chinese key set. */
export const en = {
  'type.label': 'Git',
  'guide.title': 'Git workflow',
  'guide.description': 'Review workspace changes and commit them',
  'panel.detached': '(detached HEAD)',
  'panel.refresh': 'Refresh',
  'panel.history': 'History',
  'panel.staged': 'Staged',
  'panel.changes': 'Changes',
  'panel.stage': 'Stage',
  'panel.unstage': 'Unstage',
  'panel.stageAll': 'Stage all',
  'panel.back': '← Back',
  'panel.stagedTag': 'staged',
  'badge.untracked': 'U',
  'panel.loading': 'Loading…',
  'panel.clean': 'The working tree is clean.',
  'panel.diffEmpty': 'No diff to show.',
  'panel.truncated': '… diff truncated at the size cap.',
  'panel.commitPlaceholder': 'Commit message',
  'panel.commitAction': 'Commit',
  'panel.commitCount': '{count} staged',
  'panel.commitNone': 'Stage files first',
  'panel.historyEmpty': 'No commits yet.',
  'panel.error': 'Failed: {message}',
} satisfies Record<SidebarGitKey, string>
