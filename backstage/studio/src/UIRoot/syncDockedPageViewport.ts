export type DockedPageViewportRect = {
  top: number
  left: number
  width: number
  height: number
}

const STYLE_ID = 'backstagejs-docked-viewport'
const HTML_CLASS = 'backstagejs-docked-mode'

const STYLE_CONTENT = `
html.${HTML_CLASS} {
  --backstage-dock-top: 0px;
  --backstage-dock-left: 0px;
  --backstage-dock-width: 0px;
  --backstage-dock-height: 0px;
}

html.${HTML_CLASS} body {
  position: absolute !important;
  top: var(--backstage-dock-top) !important;
  left: var(--backstage-dock-left) !important;
  width: var(--backstage-dock-width) !important;
  height: var(--backstage-dock-height) !important;
  right: auto !important;
  bottom: auto !important;
}
`

function ensureStyleElement(): HTMLStyleElement {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = STYLE_ID
    el.textContent = STYLE_CONTENT
    document.head.appendChild(el)
  }
  return el
}

export function applyDockedPageViewport(rect: DockedPageViewportRect) {
  ensureStyleElement()
  document.documentElement.classList.add(HTML_CLASS)
  document.documentElement.style.setProperty(
    '--backstage-dock-top',
    `${rect.top}px`,
  )
  document.documentElement.style.setProperty(
    '--backstage-dock-left',
    `${rect.left}px`,
  )
  document.documentElement.style.setProperty(
    '--backstage-dock-width',
    `${rect.width}px`,
  )
  document.documentElement.style.setProperty(
    '--backstage-dock-height',
    `${rect.height}px`,
  )
}

export function clearDockedPageViewport() {
  document.documentElement.classList.remove(HTML_CLASS)
  document.documentElement.style.removeProperty('--backstage-dock-top')
  document.documentElement.style.removeProperty('--backstage-dock-left')
  document.documentElement.style.removeProperty('--backstage-dock-width')
  document.documentElement.style.removeProperty('--backstage-dock-height')

  const el = document.getElementById(STYLE_ID)
  if (el) {
    el.remove()
  }
}
