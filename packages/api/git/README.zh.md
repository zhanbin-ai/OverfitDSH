---
description: "面向 Web GUI 的 Git 工作区服务：状态、差异、暂存、提交与最近历史，经 `git` 远程命名空间发布。"
kind: "package-reference"
---

# @deepseek-ai/dsh-api-git

[English](README.md) | 中文

## 概述

本包让 Web 客户端读取并整理会话工作区所在的仓库：一个类型化的远程命名空间 `git`，包含 `status`、`diff`、`stage`、`unstage`、`commit` 与 `history`。所有命令都经 `ctx.subprocess` 以显式 argv 加净化环境运行（`GIT_CONFIG_COUNT=0`、无提示、无可选锁、字面路径解析）；工作目录来自会话头部的 `cwd`（无 cwd 时以沙箱策略根为回退），因此客户端只需给出会话 id，仓库根由每次调用用 `git rev-parse --show-toplevel` 定位。

## 使用本包

把本包与 `@deepseek-ai/dsh-subprocess`、沙箱策略、会话存储一起挂载（web 组合包把它排在 workspace 文件服务一旁），客户端侧经 api-remotes 装配消费。

| 方法 | 返回 | 用途 |
|---|---|---|
| `status(sessionId)` | `GitStatus { repoRoot, branch, entries }` | 一次 `--porcelain=v1 -z` 快照；条目含暂存区/工作区字母与改名对 |
| `diff(sessionId, path, staged)` | `GitDiff { path, staged, text, truncated }` | 单文件统一差异；未跟踪文件以对 `/dev/null` 的添加形式呈现 |
| `stage(sessionId, paths)` | `GitStatus` | `git add -- <paths>`，随后返回新快照 |
| `unstage(sessionId, paths)` | `GitStatus` | `git reset -- <paths>`（未出生 HEAD 回退到 `git rm --cached`），随后返回新快照 |
| `commit(sessionId, message)` | `GitStatus` | `git commit -m`，随后返回新快照 |
| `history(sessionId)` | `GitCommit[]` | 最近的 `%h␉%s` 行，最新在前 |

### 失败码

`git/not-repository`（工作区不在任何仓库内）、`git/command-failed`（非零退出，附有界 stderr 尾部），以及载体提供的 `gateway/bad-request`（输入不可用）。调用方按 code 分支，不依赖消息文本。

### 配置

| 字段 | 默认值 | 含义 |
|---|---|---|
| `timeoutMs` | `20000` | 单条 git 命令的终止期限（毫秒） |
| `maxDiffBytes` | `262144` | 单次 diff 应答的字节上限（含原文回退） |
| `maxHistory` | `30` | 历史应答携带的提交数上限 |

## 理解实现

<details>
<summary>实现细节——点击展开</summary>

宿主方为 `Git extends TypertRemoteService`；`gitWorkspaceScope` 查找在不激活 Agent 的前提下解析会话头部，每个方法都以该作用域作为线上解析出的首参。运行器改编自 workspace-changes 交付物的子进程模式：collect 模式 stdio、固定终止宽限、退出后仍可读的 `readFrom(0)` 读取器。`/typert` 与 `/remote` 产物由 dsh-typert-generator 在 Host 阶段生成；本包不含浏览器半部，由 api-remotes 装配为客户端挂载命名空间并再导出其载荷词汇。

</details>

## 已知限制与延期工作

- **没有文件监视**——快照为拉取式，未订阅 `fs/observed`。
- **只有路径级暂存**——无块级暂存、无 stash、无分支与推送操作。
- **每次调用单一工作树**——嵌套仓库与 gitlink 对这些命令只是普通路径。
- **尚无 AI 提交信息**——由 LLM 辅助生成提交信息属单独增量；本命名空间先交付普通提交。

**运行时不变式：** 无伴生入口。服务除已解析的可执行文件外不保留可变状态；每个答案都在调用时由仓库现推。
