---
description: "Own-brand occupants (拟合 / Overfit) for the Web client's sidebar brand row and conversation hero mark; the deployment replacement for ui-brand-official."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-brand-overfit

English | [中文](README.zh.md)

## Overview

This package gives the 拟合 (Overfit) build its visible brand. It occupies the sidebar brand pair — `sidebar.brand.mark` and `sidebar.brand.name` — and the conversation hero mark, `conversation.hero.brand.mark`, replacing the shell's fish fallbacks with the product's orbital-core mark and localized name.

The mark is an orbital core: a luminous sphere held inside a tilted orbit band that softly tapers and crosses in front of the sphere — the fit locked into orbit. A soft halo, a rim light, a specular highlight and a small diamond node carry the depth; the band palette stays readable on both light and dark surfaces. The name comes from this package's `overfit` locale namespace — `拟合` in Chinese, `Overfit` in English.

## Use this package

Mount this plugin in the browser plugin roster **in place of** `@deepseek-ai/dsh-client-ui-brand-official`: an own-brand deployment composes its own occupant package instead of the official one ([ui-brand-official](../ui-brand-official/README.md) documents this replacement path). Occupying the slots is the composition path; there is no brand configuration surface.

Removing the roster row restores the shell fallbacks (the fish mark and the local-build label) with no other change.

The browser title (`DSH_CLIENT_TITLE`) and the hero headline copy remain independent concerns outside the slot system; they follow in later brand work.

## Understand the implementation

The three registrations install as one declaration-aware set: nested `ctx.slots.inject()` calls wait on the sidebar and conversation declarations, the atomic registration generator yields all three occupants, and the set withdraws together when a declaration collapses. The browser half is [`src/client/index.ts`](src/client/index.ts); the node half is an empty Loader seat.

## Known limitations and deferred work

- **The name is text, not artwork** — a wordmark asset can replace the span later.
- **The hero headline is product copy** — `hero.headline` reads 虚拟即现实 ("Virtual is real"); it ships from `ui-conversation`'s dictionaries, not from this package.
- **No hover animation of its own** — the hero mark inherits the host's gentle sway via its host class.

**Runtime note:** no companion entry. The package holds no mutable runtime state; the occupant set installs and releases through one transactional effect.
