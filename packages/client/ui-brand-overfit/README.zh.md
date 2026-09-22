---
description: "面向侧栏品牌行与会话首屏标志的拟合（Overfit）自有品牌填充；官方包 ui-brand-official 的部署替代。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-brand-overfit

[English](README.md) | 中文

## 概述

本包让「拟合（Overfit）」构建拥有自己的可见品牌：占据侧栏品牌对——`sidebar.brand.mark` 与 `sidebar.brand.name`——以及会话首屏标志 `conversation.hero.brand.mark`，用产品的轨道核心标志与本地化名称替换外壳的鱼形回退。

标志是一颗轨道核心：发光球体被一条倾斜的轨道带环抱——带体依透视由近及远渐细、前段跨过球体正面，拟合结果入轨的瞬间。柔和光晕、边缘受光、高光点与一枚菱形节点共同撑起深度；轨道配色在亮暗两种表面上都保持可读。名称来自本包的 `overfit` 语言命名空间——中文为「拟合」，英文为「Overfit」——侧栏以双语锁版同时呈现：本语言名称为主、另一语言名称在其侧（`name` + `nameSecondary`）。

## 使用本包

在浏览器插件名单中以本包**替代** `@deepseek-ai/dsh-client-ui-brand-official`：自有品牌的部署不组合官方包，而是组合自己的填充包（替代路径见 [ui-brand-official](../ui-brand-official/README.zh.md)）。占据 slot 是唯一的组合路径；这里不存在任何品牌配置面。

删除名单行即恢复外壳回退（鱼形标志与本地构建标签），其余不受影响。

浏览器标题（`DSH_CLIENT_TITLE`）与首屏文案是 slot 系统之外的独立事项，分别随部署环境与 `ui-conversation` 的字典发布。

## 理解实现

三个注册作为一组声明感知的集合安装：嵌套的 `ctx.slots.inject()` 调用分别等待侧栏与会话的声明，原子注册生成器一次产出三个填充，声明消失时整组一并撤回。浏览器半部是 [`src/client/index.ts`](src/client/index.ts)；node 半部是一个空 Loader 座位。

## 已知限制与延期工作

- **名称是文本而非字标**——后续可用字标资源替换该 span。
- **首屏文案是产品文案**——`hero.headline` 现为「虚拟即现实」（英文侧 “Virtual is real”）、`hero.subheadline` 在其下补一行英文箴言 “Creation Imitates Nature.”，两者均随 `ui-conversation` 的字典发布，不由本包提供。
- **自身无悬停动画**——首屏标志经由宿主 class 继承轻微的摆动效果。

**运行时不变式：** 不发布伴生入口。本包不保留可变运行时状态；填充集合通过同一个事务性 effect 安装与释放。
