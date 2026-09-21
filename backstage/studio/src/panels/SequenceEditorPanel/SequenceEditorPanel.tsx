import {resolveSequenceEditorSheet} from '@unseenco/backstage/studio/selectors'
import {usePrism, useVal} from '@unseenco/backstage/react'
import {valToAtom} from '@unseenco/backstage-shared/utils/valToAtom'
import type {Pointer} from '@unseenco/backstage/dataverse'
import {prism, val} from '@unseenco/backstage/dataverse'
import React, {useCallback, useLayoutEffect, useMemo, useState} from 'react'
import styled from 'styled-components'

import DopeSheet from './DopeSheet/DopeSheet'
import GraphEditor from './GraphEditor/GraphEditor'
import type {PanelDims, SequenceEditorPanelLayout} from './layout/layout'
import {sequenceEditorPanelLayout} from './layout/layout'
import RightOverlay from './RightOverlay/RightOverlay'
import BasePanel, {
  usePanel,
} from '@unseenco/backstage/studio/panels/BasePanel/BasePanel'
import type {PanelPosition} from '@unseenco/backstage/studio/store/types'
import PanelWrapper from '@unseenco/backstage/studio/panels/BasePanel/PanelWrapper'
import FrameStampPositionProvider from './FrameStampPositionProvider'
import GraphEditorToggle from './GraphEditorToggle'
import {
  panelZIndexes,
  TitleBar,
  TitleBar_Piece,
  TitleBar_Punctuation,
} from '@unseenco/backstage/studio/panels/BasePanel/common'
import type {UIPanelId} from '@unseenco/backstage-shared/utils/ids'
import {getStudioActiveSequenceVariant} from '@unseenco/backstage/studio/utils/activeSequenceVariant'
import {usePresenceListenersOnRootElement} from '@unseenco/backstage/studio/uiComponents/usePresence'
import {useLayoutMode} from '@unseenco/backstage/studio/UIRoot/LayoutModeContext'
import DockResizeHandle from '@unseenco/backstage/studio/UIRoot/DockResizeHandle'
import {DOCKED_PANE_BACKGROUND} from '@unseenco/backstage/studio/UIRoot/dockedLayoutConstants'
import PlaybackControls from './PlaybackControls/PlaybackControls'
import {transportStripHeight} from './PlaybackControls/constants'
import GsapClipPlayheadSync from '@unseenco/backstage/studio/gsap/GsapClipPlayheadSync'
import GsapScrollTriggerLayoutSync from '@unseenco/backstage/studio/gsap/GsapScrollTriggerLayoutSync'

const Container = styled(PanelWrapper)<{$docked?: boolean}>`
  z-index: ${panelZIndexes.sequenceEditorPanel};
  border: ${({$docked}) =>
    $docked ? 'none' : '1px solid var(--studio-border)'};
  border-radius: ${({$docked}) => ($docked ? '0' : 'var(--studio-radius)')};
  box-sizing: border-box;
  overflow: ${({$docked}) => ($docked ? 'visible' : 'hidden')};
`

const LeftBackground = styled.div<{$docked?: boolean}>`
  background-color: ${({$docked}) =>
    $docked ? DOCKED_PANE_BACKGROUND : 'var(--studio-panel-bg, #282b2f)'};
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: -1;
  pointer-events: none;
`

export const zIndexes = (() => {
  const s = {
    rightBackground: 0,
    scrollableArea: 0,
    rightOverlay: 0,
    lengthIndicatorCover: 0,
    lengthIndicatorStrip: 0,
    playhead: 0,
    currentFrameStamp: 0,
    marker: 0,
    horizontalScrollbar: 0,
  }

  // sort the z-indexes
  let i = -1
  for (const key of Object.keys(s)) {
    s[key] = i
    i++
  }

  return s
})()

const Header_Container = styled.div`
  position: absolute;
  left: 0;
  top: ${transportStripHeight}px;
  z-index: 1;
`

const defaultPosition: PanelPosition = {
  edges: {
    left: {from: 'screenLeft', distance: 0.1},
    right: {from: 'screenRight', distance: 0.2},
    top: {from: 'screenBottom', distance: 0.4},
    bottom: {from: 'screenBottom', distance: 0.01},
  },
}

const minDims = {width: 800, height: 200}

const SequenceEditorPanel: React.VFC<{}> = (props) => {
  const {isDocked, sequencerHeight, viewportWidth} = useLayoutMode()

  const overrideDims = isDocked
    ? {
        width:
          typeof window !== 'undefined' ? window.innerWidth : viewportWidth,
        height: sequencerHeight,
        left: 0,
        top: 0,
      }
    : undefined

  return (
    <BasePanel
      panelId={'sequenceEditor' as UIPanelId}
      defaultPosition={defaultPosition}
      minDims={minDims}
      overrideDims={overrideDims}
    >
      <Content />
    </BasePanel>
  )
}

const Content: React.VFC<{}> = () => {
  const {dims} = usePanel()
  const {isDocked, sequencerHeight} = useLayoutMode()
  const [containerNode, setContainerNode] = useState<null | HTMLDivElement>(
    null,
  )
  const [dockedMeasuredWidth, setDockedMeasuredWidth] = useState<number | null>(
    null,
  )

  useLayoutEffect(() => {
    if (!isDocked || !containerNode) {
      setDockedMeasuredWidth((prev) => (prev === null ? prev : null))
      return
    }

    const updateWidth = (entries?: ResizeObserverEntry[]) => {
      const w = Math.round(
        entries?.[0]?.contentRect.width ??
          containerNode.getBoundingClientRect().width,
      )
      setDockedMeasuredWidth((prev) => (prev === w ? prev : w))
    }

    updateWidth()
    const observer = new ResizeObserver((entries) => updateWidth(entries))
    observer.observe(containerNode)
    return () => observer.disconnect()
  }, [isDocked, containerNode])

  usePresenceListenersOnRootElement(containerNode)

  const preventWheelOnContainerRef = useMemo(
    () => preventHorizontalWheelEvents(),
    [],
  )

  const setContainerRef = useCallback(
    (elt: HTMLDivElement | null) => {
      preventWheelOnContainerRef(elt)
      // Ignore ref(null) when React swaps callback identity — avoids update loops.
      if (elt != null) {
        setContainerNode((prev) => (prev === elt ? prev : elt))
      }
    },
    [preventWheelOnContainerRef],
  )

  return usePrism(() => {
    const panelSize = prism.memo(
      'panelSize',
      (): PanelDims => {
        if (isDocked) {
          const width =
            dockedMeasuredWidth && dockedMeasuredWidth > 0
              ? dockedMeasuredWidth
              : dims.width
          const height = sequencerHeight
          const screenY =
            typeof window !== 'undefined'
              ? window.innerHeight - height
              : dims.top

          return {
            width,
            height,
            widthWithoutBorder: width - 2,
            heightWithoutBorder: height - 4,
            screenX: 0,
            screenY,
          }
        }

        return {
          width: dims.width,
          height: dims.height,
          widthWithoutBorder: dims.width - 2,
          heightWithoutBorder: dims.height - 4,
          screenX: dims.left,
          screenY: dims.top,
        }
      },
      [dims, isDocked, sequencerHeight, dockedMeasuredWidth],
    )

    const sheet = resolveSequenceEditorSheet({
      fallbackToProjectSheet: isDocked,
    })

    if (!sheet) return <></>

    const panelSizeP = valToAtom('panelSizeP', panelSize).pointer

    // We make a unique key based on the sheet's address, so that
    // <Left /> and <Right />
    // don't have to listen to changes in sheet
    const key = prism.memo('key', () => JSON.stringify(sheet.address), [sheet])

    const layoutP = prism
      .memo(
        'layout',
        () => {
          return sequenceEditorPanelLayout(sheet, panelSizeP, {isDocked})
        },
        [sheet, panelSizeP, isDocked],
      )
      .getValue()

    return (
      <SequenceEditorPanelContainer
        layoutP={layoutP}
        sheetKey={key}
        isDocked={isDocked}
        setContainerRef={setContainerRef}
      />
    )
  }, [dims, isDocked, sequencerHeight, dockedMeasuredWidth, setContainerRef])
}

const SequenceEditorPanelContainer: React.VFC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  sheetKey: string
  isDocked: boolean
  setContainerRef: (elt: HTMLDivElement | null) => void
}> = ({layoutP, sheetKey, isDocked, setContainerRef}) => {
  const hasSequenceContent = useVal(layoutP.tree.children).length > 0
  const graphEditorAvailable = useVal(layoutP.graphEditorDims.isAvailable)
  const graphEditorOpen = useVal(layoutP.graphEditorDims.isOpen)
  const leftWidth = useVal(layoutP.leftDims.width)

  if (!isDocked && !hasSequenceContent) {
    return null
  }

  return (
    <Container
      docked={isDocked}
      showResizers={!isDocked}
      $docked={isDocked}
      ref={setContainerRef}
    >
      {isDocked && <DockResizeHandle edge="sequencerTop" />}
      <LeftBackground $docked={isDocked} style={{width: `${leftWidth}px`}} />
      <FrameStampPositionProvider layoutP={layoutP}>
        <GsapClipPlayheadSync />
        <GsapScrollTriggerLayoutSync />
        <PlaybackControls layoutP={layoutP} docked={isDocked} />
        <Header layoutP={layoutP} />
        <DopeSheet
          key={sheetKey + '-dopeSheet'}
          layoutP={layoutP}
          isDocked={isDocked}
        />
        {graphEditorOpen && (
          <GraphEditor key={sheetKey + '-graphEditor'} layoutP={layoutP} />
        )}
        {graphEditorAvailable && <GraphEditorToggle layoutP={layoutP} />}
        <RightOverlay layoutP={layoutP} />
      </FrameStampPositionProvider>
    </Container>
  )
}

const Header: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({layoutP}) => {
  return usePrism(() => {
    const sheet = val(layoutP.sheet)
    const activeVariant = getStudioActiveSequenceVariant(sheet.address)
    const titleBar = (
      <TitleBar>
        <TitleBar_Piece>{sheet.address.sheetId} </TitleBar_Piece>

        <TitleBar_Punctuation>{':'}&nbsp;</TitleBar_Punctuation>
        <TitleBar_Piece>{activeVariant} </TitleBar_Piece>

        <TitleBar_Punctuation>&nbsp;{'>'}&nbsp;</TitleBar_Punctuation>
        <TitleBar_Piece>Sequence</TitleBar_Piece>
      </TitleBar>
    )

    return (
      <Header_Container
        style={{
          width: val(layoutP.leftDims.width),
        }}
      >
        {titleBar}
      </Header_Container>
    )
  }, [layoutP])
}

export default SequenceEditorPanel

const preventHorizontalWheelEvents = () => {
  let lastNode: null | HTMLElement = null
  const listenerOptions = {
    passive: false,
    capture: false,
  }

  const receiveWheelEvent = (event: WheelEvent) => {
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return (node: HTMLElement | null) => {
    if (lastNode !== node && lastNode) {
      lastNode.removeEventListener('wheel', receiveWheelEvent, listenerOptions)
    }
    lastNode = node
    if (node) {
      node.addEventListener('wheel', receiveWheelEvent, listenerOptions)
    }
  }
}
