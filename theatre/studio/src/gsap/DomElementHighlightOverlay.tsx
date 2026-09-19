import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

type DomElementHighlightContextValue = {
  showElementHighlight: (element: Element) => void
  hideElementHighlight: () => void
}

const DomElementHighlightContext =
  createContext<DomElementHighlightContextValue | null>(null)

export function DomElementHighlightProvider(props: {
  children: React.ReactNode
}): React.ReactElement {
  const [rect, setRect] = useState<DOMRect | null>(null)

  const showElementHighlight = useCallback((element: Element) => {
    if (typeof document === 'undefined' || !element.isConnected) {
      setRect(null)
      return
    }
    setRect(element.getBoundingClientRect())
  }, [])

  const hideElementHighlight = useCallback(() => {
    setRect(null)
  }, [])

  const value = useMemo(
    () => ({showElementHighlight, hideElementHighlight}),
    [showElementHighlight, hideElementHighlight],
  )

  return (
    <DomElementHighlightContext.Provider value={value}>
      {props.children}
      {rect ? <DomElementHighlightOverlay rect={rect} /> : null}
    </DomElementHighlightContext.Provider>
  )
}

export function useDomElementHighlight(): DomElementHighlightContextValue {
  const ctx = useContext(DomElementHighlightContext)
  if (!ctx) {
    throw new Error(
      'useDomElementHighlight must be used within DomElementHighlightProvider',
    )
  }
  return ctx
}

const DomElementHighlightOverlay: React.VFC<{rect: DOMRect}> = ({rect}) => {
  return (
    <div
      data-theatre-gsap-target-highlight=""
      style={{
        position: 'fixed',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        boxSizing: 'border-box',
        border: '2px solid rgba(0, 180, 255, 0.85)',
        borderRadius: 2,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  )
}
