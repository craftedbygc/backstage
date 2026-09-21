import {encodeDomElementHighlightTarget} from '@unseenco/backstage-shared/gsap/domElementHighlightTarget'
import {
  onRemoteDomElementHighlightChange,
  postRemoteDomHighlightBroadcast,
  postRemoteDomHighlightClear,
} from '@unseenco/backstage-shared/sheets/remoteDomElementHighlight'
import {getSequenceEditorProjectId} from '@unseenco/backstage/studio/selectors'
import {isRemoteEditorWindow} from '@unseenco/backstage/studio/remoteEditor'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import styled from 'styled-components'
import {
  getOffViewportSides,
  intersectRectWithViewport,
} from './domElementHighlightViewport'

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
    if (isRemoteEditorWindow()) {
      const projectId = getSequenceEditorProjectId()
      const target = encodeDomElementHighlightTarget(element)
      if (projectId && target) {
        postRemoteDomHighlightBroadcast(projectId, target)
      }
      return
    }
    setRect(element.getBoundingClientRect())
  }, [])

  const hideElementHighlight = useCallback(() => {
    if (isRemoteEditorWindow()) {
      const projectId = getSequenceEditorProjectId()
      if (projectId) {
        postRemoteDomHighlightClear(projectId)
      }
      return
    }
    setRect(null)
  }, [])

  useEffect(() => {
    if (isRemoteEditorWindow()) {
      return
    }
    return onRemoteDomElementHighlightChange((element) => {
      if (!element || !element.isConnected) {
        setRect(null)
        return
      }
      setRect(element.getBoundingClientRect())
    })
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

/** Above `#pointer-root` shell (z-index 50) when highlight renders as its sibling. */
const HIGHLIGHT_Z_INDEX = 49

const EdgeArrow = styled.div<{
  $edge: 'top' | 'bottom' | 'left' | 'right'
}>`
  position: fixed;
  pointer-events: none;
  z-index: ${HIGHLIGHT_Z_INDEX + 1};
  color: rgba(0, 180, 255, 0.95);
  font-size: 18px;
  line-height: 1;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.85);
  ${(p) => {
    switch (p.$edge) {
      case 'top':
        return `
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
        `
      case 'bottom':
        return `
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
        `
      case 'left':
        return `
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
        `
      case 'right':
        return `
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
        `
    }
  }}
`

const ARROW_GLYPH = {
  top: '▲',
  bottom: '▼',
  left: '◀',
  right: '▶',
} as const

const DomElementHighlightOverlay: React.VFC<{rect: DOMRect}> = ({rect}) => {
  const offViewport = getOffViewportSides(rect)
  const showHighlightOnScreen = intersectRectWithViewport(rect) !== null
  const showArrows =
    offViewport.top ||
    offViewport.bottom ||
    offViewport.left ||
    offViewport.right

  return (
    <>
      {showHighlightOnScreen ? (
        <div
          data-backstage-gsap-target-highlight=""
          style={{
            position: 'fixed',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxSizing: 'border-box',
            border: '2px solid rgba(0, 180, 255, 0.5)',
            backgroundColor: 'rgba(0, 180, 255, 0.1)',
            borderRadius: 2,
            pointerEvents: 'none',
            zIndex: HIGHLIGHT_Z_INDEX,
          }}
        />
      ) : null}
      {showArrows ? (
        <>
          {offViewport.top ? (
            <EdgeArrow $edge="top">{ARROW_GLYPH.top}</EdgeArrow>
          ) : null}
          {offViewport.bottom ? (
            <EdgeArrow $edge="bottom">{ARROW_GLYPH.bottom}</EdgeArrow>
          ) : null}
          {offViewport.left ? (
            <EdgeArrow $edge="left">{ARROW_GLYPH.left}</EdgeArrow>
          ) : null}
          {offViewport.right ? (
            <EdgeArrow $edge="right">{ARROW_GLYPH.right}</EdgeArrow>
          ) : null}
        </>
      ) : null}
    </>
  )
}
