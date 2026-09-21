---
description: "右侧栏 Git 工作台 tab 类型：注册 git tab 与引导入口和占位正文；工作区变更、diff 与提交将在后续里程碑落地"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-git

[English](README.md) | 中文

## Summary

注册右侧栏 `git` tab 类型：一个引导入口加占位正文，说明规划中的工作区变更、diff 与提交界面。本包用于端到端验证产品的客户端插件管线（包 → 构建 → 浏览器名册 → 挂载 tab）；工作台本体将在后续里程碑随宿主服务一并落地。

## Use this package

无需手动挂载：它是 `dsh-web-app` bundle 的一个 `dsh.client` 行，Web 与 Desktop profile 会随浏览器名册一同加载。tab 从右侧栏引导页的「Git 工作流」入口打开，或通过 `ctx.sidebarRight.openTab('git')`。

## Configuration

无。本包没有配置面；文案来自 `sidebarGit` locale 命名空间。

## Extension points

暂无。tab 正文是占位实现；后续里程碑会在同一 tab 之后加入宿主服务（工作区变更、diff、提交）。

## Model Experience

无：本包只贡献浏览器呈现，不会有任何内容进入模型请求。

#### KV Cache effect

无；本包不组装也不发送任何 provider 请求。

## Known Limitations and Deferred Work

- 正文是刻意的静态占位：工作区变更、diff、提交、分支与历史属于后续工作（产品计划的 S3）。
- 暂无测试；管线验证 spike（S1）先于带测试的实现。

## Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
