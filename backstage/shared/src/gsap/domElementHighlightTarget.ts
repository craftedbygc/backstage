/** Stable identity for a page element shown in GSAP target pills. */
export type RemoteDomHighlightTarget =
  | {type: 'id'; id: string; label: string}
  | {type: 'selector'; selector: string; label: string}

export function labelDomElementForHighlight(el: Element): string {
  if (el.id) {
    return `#${el.id}`
  }
  const tag = el.tagName.toLowerCase()
  if (el instanceof HTMLElement) {
    const className = el.className
    if (typeof className === 'string' && className.trim().length > 0) {
      const firstClass = className.trim().split(/\s+/)[0]
      if (firstClass) {
        return `${tag}.${firstClass}`
      }
    }
  }
  return tag
}

export function encodeDomElementHighlightTarget(
  element: Element,
): RemoteDomHighlightTarget | null {
  if (typeof document === 'undefined' || !element.isConnected) {
    return null
  }
  const label = labelDomElementForHighlight(element)
  if (element.id) {
    return {type: 'id', id: element.id, label}
  }
  return {type: 'selector', selector: label, label}
}

export function resolveDomElementHighlightTarget(
  target: RemoteDomHighlightTarget,
): Element | null {
  if (typeof document === 'undefined') {
    return null
  }
  if (target.type === 'id') {
    return document.getElementById(target.id)
  }
  try {
    const match = document.querySelector(target.selector)
    return match instanceof Element ? match : null
  } catch {
    return null
  }
}
