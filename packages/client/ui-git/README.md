---
description: "Git workbench tab type for the right Sidebar: registers the git tab with a guide entry and a placeholder body; workspace changes, diffs, and commits land in later milestones"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-git

English | [中文](README.zh.md)

## Summary

Registers the right-Sidebar `git` tab type: a guide entry plus a placeholder body that names the planned workspace-changes, diff, and commit surfaces. The package proves the product's client-plugin pipeline end to end (package → build → browser roster → mounted tab); the workbench itself lands in later milestones as host services appear.

## Use this package

Nothing mounts this package by hand: it is a `dsh.client` row of the `dsh-web-app` bundle, so the Web and Desktop profiles load it with the rest of the browser roster. The tab opens from the right Sidebar's guide page (the「Git 工作流」entry) or `ctx.sidebarRight.openTab('git')`.

## Configuration

None. The package carries no configuration surface; its copy comes from the `sidebarGit` locale namespace.

## Extension points

None yet. The tab body is a placeholder; later milestones add host services (workspace changes, diff, commit) behind the same tab.

## Model Experience

None, as the package contributes browser presentation only; nothing here reaches a model request.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

- The body is a static placeholder by design: workspace changes, diffs, commits, branches, and history are future work (the product plan's S3).
- No tests yet; the pipeline spike (S1) precedes the test-bearing implementation.

## Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
