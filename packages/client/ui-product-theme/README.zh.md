---
description: "产品主题层：通过 ui-theme 的覆盖缝，把平台强调色、链接色与主按钮色朝产品色板方向试点调整（S2 试点，可整层回退）"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-product-theme

[English](README.md) | 中文

## Summary

产品的主题层，通过 `ui-theme` 的覆盖缝（`ctx.theme.overrideTokens`）以 token 覆盖栈的形式落在活动主题之上。不注册新主题 id、不碰 DOM：五个别名 token（平台强调色、链接、主按钮的填充/悬停/置暗）各带一组 `{ light, dark }` 的暂定青绿（teal）色值。它是 S2 的试点实现——在最终品牌色板替换数值之前，先把"产品色板"机制端到端跑通。

## Use this package

无需手动挂载：它是 `dsh-web-app` bundle 的一个 `dsh.client` 行。它注入 `theme` 服务，因此会在 `ui-theme` 提供该服务后激活，并随自己的 fiber 一起卸载。

## Configuration

无。试点色值以常量形式写在 `src/client/index.ts`；最终色板随品牌决策一并落地。

## Extension points

无。这一层本身就是扩展点：其他组合可以通过同一个缝继续叠加 token 层，后面的层按 token 逐个覆盖。

## Model Experience

无：本包只贡献浏览器呈现，不会有任何内容进入模型请求。

#### KV Cache effect

无；本包不组装也不发送任何 provider 请求。

## Known Limitations and Deferred Work

- 青绿是刻意的试点色：产品名与色板定稿后替换为品牌色板。
- 密度、字体与形状 token 在 v0 中刻意不动；覆盖缝允许调整它们，但试点保持最小可评审集合。
- 暂无测试；试点先于带测试的实现。

## Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
