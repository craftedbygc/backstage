export type OffViewportSides = {
  top: boolean
  bottom: boolean
  left: boolean
  right: boolean
}

export function getOffViewportSides(rect: DOMRect): OffViewportSides {
  if (typeof window === 'undefined') {
    return {top: false, bottom: false, left: false, right: false}
  }
  const {innerWidth, innerHeight} = window
  return {
    top: rect.top < 0,
    bottom: rect.bottom > innerHeight,
    left: rect.left < 0,
    right: rect.right > innerWidth,
  }
}

export function intersectRectWithViewport(rect: DOMRect): DOMRect | null {
  if (typeof window === 'undefined') {
    return rect
  }
  const {innerWidth, innerHeight} = window
  const left = Math.max(0, rect.left)
  const top = Math.max(0, rect.top)
  const right = Math.min(innerWidth, rect.right)
  const bottom = Math.min(innerHeight, rect.bottom)
  const width = right - left
  const height = bottom - top
  if (width <= 0 || height <= 0) {
    return null
  }
  if (typeof DOMRect !== 'undefined') {
    return new DOMRect(left, top, width, height)
  }
  return {
    top,
    left,
    width,
    height,
    right: left + width,
    bottom: top + height,
  } as DOMRect
}
