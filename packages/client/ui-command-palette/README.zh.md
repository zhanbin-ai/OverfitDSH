---
description: "面向 Web 客户端的 Ctrl+K 命令面板：一个壳层弹窗，统一搜索会话、工作区与内置应用命令。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-command-palette

[English](README.md) | 中文

## 概述

在任意界面按 Ctrl+K（macOS 为 ⌘K）呼出一个弹窗，找到并执行你需要的：最近会话（切换）、工作区（打开），以及内置命令——新建会话、打开 Git 面板、打开设置、外观切换（浅色 / 深色 / 跟随系统）。搜索框始终持有焦点：↑↓ 移动高亮，Enter 执行当前行，Esc 或点击外部关闭。

## 使用本包

挂载本包即可：弹窗自动注册进 `shell.overlay` 并安装全局热键。条目在每次打开时由客户端实时状态构建，执行走与其他界面完全相同的服务。

| 条目分组 | 数据来源 | 执行动作 |
|---|---|---|
| 会话（最近在前，至多 25 条） | 会话列表（`ctx.sessions`） | `ctx.uiWorkspace.openSession` |
| 工作区 | 工作区列表（`ctx.workspaces`） | `ctx.uiWorkspace.openWorkspace` |
| 命令 | 内置集合 | `startSession` / 右栏 `openTab` / `theme.setTheme` / 设置触发器 |

## 理解实现

`entries.ts` 是纯逻辑：`buildEntries` 把客户端快照投影为行，`filterEntries` 做大小写不敏感的子串排序（标签前缀 > 标签命中 > 载荷命中；同分保持构建顺序）。`Palette.tsx` 只持有查看态——打开标志、查询、高亮——从不写业务状态。设置保留了一处刻意的 DOM 调用（`openSettingsPanel`）：设置面板的打开状态属于设置外壳的组件内状态，它的公开入口就是那个触发按钮；找不到触发器时静默无操作。

## 已知限制与延期工作

- **仅内置条目**——尚无插件贡献的命令注册表。
- **无使用历史**——没有最近/频率加权；会话按构建顺序（最近在前）。
- **设置打开在上一分节**——深链到指定分节属延期项。
- **仅子串匹配**——无子序列模糊匹配（对中文已友好）。

**运行时不变式：** 无伴生入口；占用者通过同一个事务性 effect 安装与释放。
