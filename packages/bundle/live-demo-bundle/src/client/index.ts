/**
 * Browser half: paints a visible banner so that installing/enabling this
 * bundle is observable without a page reload. The returned cleanup lets a
 * bundle removal take the banner back down through the same Cordis effect.
 */

const BANNER_ID = 'dsh-live-demo-banner'

/** Cordis plugin name (matches the composition row id by convention). */
export const name = 'ui-live-demo'

/**
 * Client plugin body: mount the demo banner.
 * @param ctx - client root context; effect() takes an optional cleanup.
 */
export function apply(ctx: {
  effect: (callback: () => void | (() => void), label?: string) => void
}): void {
  ctx.effect(() => {
    const el = document.createElement('div')
    el.id = BANNER_ID
    el.textContent = `LIVE-DEMO 插件已装载（运行中安装 @ ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}）`
    el.style.cssText = [
      'position: fixed',
      'top: 14px',
      'left: 50%',
      'transform: translateX(-50%)',
      'z-index: 2147483000',
      'padding: 9px 22px',
      'border-radius: 999px',
      'background: linear-gradient(120deg, #0d6a66, #0f8f88)',
      'color: #ffffff',
      'font: 600 13px/1.4 "Segoe UI", system-ui, sans-serif',
      'letter-spacing: 0.02em',
      'box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35)',
      'border: 1px solid rgba(255, 255, 255, 0.28)',
      'pointer-events: none',
    ].join(';')
    document.body.appendChild(el)
    return () => {
      el.remove()
    }
  }, 'ui-live-demo: banner')
}
