---
description: "Product theme layer: tentatively retints the platform accent, links, and primary buttons toward the product palette through the ui-theme override seam (S2 pilot; removable as one layer)"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-product-theme

English | [中文](README.zh.md)

## Summary

The product's theme layer, implemented as a token-override stack over the active theme through the `ui-theme` seam (`ctx.theme.overrideTokens`). No new theme id, no DOM: five alias tokens (platform accent, link, primary button fill/hover/dimmed) carry a tentative teal family, one `{ light, dark }` pair each. This is the S2 pilot that proves the product-palette mechanism end to end before the final brand palette replaces the values.

## Use this package

Nothing mounts this package by hand: it is a `dsh.client` row of the `dsh-web-app` bundle. It injects the `theme` service, so it activates after `ui-theme` provides it and unloads with its fiber.

## Configuration

None. The pilot values live in `src/client/index.ts` as a constant; the final palette arrives with the brand decision.

## Extension points

None. The layer itself is the extension: other compositions can stack further token layers through the same seam, later layers winning per-token.

## Model Experience

None, as the package contributes browser presentation only; nothing here reaches a model request.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

- The teal values are a deliberate pilot: replace them with the brand palette once the product name and palette are decided.
- Density, typography, and shape tokens are intentionally untouched in v0; the seam permits them, but the pilot keeps a minimal, reviewable set.
- No tests yet; the pilot precedes the test-bearing implementation.

## Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
