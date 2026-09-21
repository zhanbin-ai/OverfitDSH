---
description: "Git workbench tab type for the right Sidebar: change list, unified diffs, staging, and commits over the `git` Remote namespace, plus recent history."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-git

English | [中文](README.zh.md)

## Summary

Use this package to work with the Session workspace's repository from the right Sidebar: it registers the `git` tab type, its guide entry, and a workbench body. The body lists staged and changed paths, opens one unified diff per click, stages and unstages single paths (or every change at once), shows recent history on demand, and commits the index with the message the reader writes. Every call goes through the `git` Remote namespace (`@deepseek-ai/dsh-api-git`); the body holds no host state, and the injected face binds one Session id.

## Use this package

Mount the package and open the Git tab from the right Sidebar (the tab type also has a guide entry), then:

| Control | Behavior |
|---|---|
| Branch chip | Current branch of the Session workspace's repository, or `(detached HEAD)` |
| Changes list | Work-tree changes; a row click opens its unstaged diff; per-row action stages it; 全部暂存 stages all |
| Staged list | Index changes; a row click opens its staged diff; per-row action unstages it |
| History | The most recent commits, newest first, loaded on first open |
| Commit box | Message plus 提交 commits the index and refreshes the snapshot |

A workspace outside any repository answers `git/not-repository` in the failure banner; a repository without commits answers history with an empty list.

## Understand the implementation

The tab's asynchronous half is `face.ts`: it binds the `git` namespace to the Session the Slot framework resolved and hands the component plain result-returning functions. The component keeps state locally; every mutating call answers a fresh `status` snapshot, so the lists and the commit box never guess — and a failure lands in one banner instead of a toast. Styling is CSS Modules over `--dsw-*` tokens, with per-kind colour families for the status letters.

## Known limitations and deferred work

- **No file watcher** — refresh is the explicit control plus post-action snapshots; an automatic refresh at turn end is deferred.
- **No hunk-level staging** — staging is per path; split view, hunk selection, and branch operations are deferred.
- **No AI commit message** — the 生成提交信息 affordance ships with the LLM wiring in a later increment.
- **Diff size** — one diff is capped by the Host configuration (256 KiB by default); a cut diff is marked truncated in the pane.
