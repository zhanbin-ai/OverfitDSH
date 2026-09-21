---
description: "面向侧栏品牌行与会话首屏标志的拟合（Overfit）自有品牌填充；官方包 ui-brand-official 的部署替代。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-brand-overfit

[English](README.md) | 中文

## 概述

本包让「拟合（Overfit）」构建拥有自己的可见品牌：占据侧栏品牌对——`sidebar.brand.mark` 与 `sidebar.brand.name`——以及会话首屏标志 `conversation.hero.brand.mark`，用产品的拟合曲线标志与本地化名称替换外壳的鱼形回退。

标志是一条穿过三个样本点的平滑曲线：拟合二字最字面的手势。它以纯 SVG、`currentColor` 绘制，每个界面都能随主题着色，无需第二份资源。名称来自本包的 `overfit` 语言命名空间——中文为「拟合」，英文为「Overfit」。

## 使用本包

在浏览器插件名单中以本包**替代** `@deepseek-ai/dsh-client-ui-brand-official`：自有品牌的部署不组合官方包，而是组合自己的填充包（替代路径见 [ui-brand-official](../ui-brand-official/README.zh.md)）。占据 slot 是唯一的组合路径；这里不存在任何品牌配置面。

删除名单行即恢复外壳回退（鱼形标志与本地构建标签），其余不受影响。

浏览器标题（`DSH_CLIENT_TITLE`）与首屏主标题文案是 slot 系统之外的独立事项，将在后续品牌工作中跟进。

## 理解实现

三个注册作为一组声明感知的集合安装：嵌套的 `ctx.slots.inject()` 调用分别等待侧栏与会话的声明，原子注册生成器一次产出三个填充，声明消失时整组一并撤回。浏览器半部是 [`src/client/index.ts`](src/client/index.ts)；node 半部是一个空 Loader 座位。

## 已知限制与延期工作

- **名称是文本而非字标**——后续可用字标资源替换该 span。
- **首屏主标题沿用上游文案**——`hero.headline` 仍为「探索未至之境」，等待品牌文案决策落地。
- **自身无悬停动画**——首屏标志经由宿主 class 继承轻微的摆动效果。

**运行时不变式：** 不发布伴生入口。本包不保留可变运行时状态；填充集合通过同一个事务性 effect 安装与释放。
