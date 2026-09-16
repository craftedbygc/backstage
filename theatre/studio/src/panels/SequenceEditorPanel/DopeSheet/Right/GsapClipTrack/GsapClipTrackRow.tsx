import type {GsapClipTrack} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import type {SequenceEditorPanelLayout} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_GsapClipTrack} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism, useVal} from '@unseenco/theatre-react'
import type {Pointer} from '@unseenco/theatre-dataverse'
import {val} from '@unseenco/theatre-dataverse'
import React, {useMemo} from 'react'
import styled from 'styled-components'
import RightRow from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/Right/Row'
import getStudio from '@unseenco/theatre-studio/getStudio'
import type {DragOpts} from '@unseenco/theatre-studio/uiComponents/useDrag'
import useDrag from '@unseenco/theatre-studio/uiComponents/useDrag'
import {useCssCursorLock} from '@unseenco/theatre-studio/uiComponents/PointerEventsHandler'
import type {CommitOrDiscard} from '@unseenco/theatre-studio/StudioStore/StudioStore'
import {getStudioActiveSequenceVariant} from '@unseenco/theatre-studio/utils/activeSequenceVariant'
import {getSequenceStateFromSheet} from '@unseenco/theatre-studio/utils/sequenceVariantHelpers'
import useRefAndState from '@unseenco/theatre-studio/utils/useRefAndState'
import useContextMenu from '@unseenco/theatre-studio/uiComponents/simpleContextMenu/useContextMenu'
import type {IContextMenuItem} from '@unseenco/theatre-studio/uiComponents/simpleContextMenu/useContextMenu'
import {previewGsapClipsAtCurrentPlayhead} from '@unseenco/theatre-studio/gsap/previewGsapClipsAtPlayhead'

const Container = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`

const ClipBar = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 14px;
  border-radius: 3px;
  background: #6b8f71;
  border: 1px solid #8fb396;
  box-sizing: border-box;
  cursor: grab;
`

const EdgeHandle = styled.div<{$side: 'left' | 'right'}>`
  position: absolute;
  top: -5px;
  bottom: -5px;
  width: 12px;
  cursor: ew-resize;
  z-index: 1;
  ${(props) => (props.$side === 'left' ? 'left: 0;' : 'right: 0;')}

  &::after {
    content: '';
    position: absolute;
    top: 7px;
    bottom: 7px;
    width: 2px;
    border-radius: 1px;
    background: rgba(255, 255, 255, 0.35);
    ${(props) => (props.$side === 'left' ? 'left: 4px;' : 'right: 4px;')}
  }
`

const GsapClipTrackRow: React.VFC<{
  leaf: SequenceEditorTree_GsapClipTrack
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => {
  return usePrism(() => {
    const sheetState = val(
      getStudio()!.atomP.historic.coreByProject[
        leaf.sheetObject.address.projectId
      ].sheetsById[leaf.sheetObject.address.sheetId],
    )
    const activeVariant = getStudioActiveSequenceVariant(
      leaf.sheetObject.sheet.address,
    )
    const trackVariant =
      leaf.sheetObject.template.getSequenceVariantOwningTrack(
        leaf.trackId,
        activeVariant,
      ) ?? activeVariant
    const trackData = getSequenceStateFromSheet(sheetState, trackVariant)
      ?.tracksByObject[leaf.sheetObject.address.objectKey]?.trackData[
      leaf.trackId
    ]

    if (!trackData || trackData.type !== 'GsapClipTrack') {
      return <RightRow leaf={leaf} isCollapsed={false} node={<div />} />
    }

    const node = (
      <GsapClipTrackBar
        leaf={leaf}
        layoutP={layoutP}
        trackData={trackData}
        sequenceVariant={trackVariant}
      />
    )

    return <RightRow leaf={leaf} isCollapsed={false} node={node} />
  }, [leaf, layoutP])
}

const GsapClipTrackBar: React.VFC<{
  leaf: SequenceEditorTree_GsapClipTrack
  layoutP: Pointer<SequenceEditorPanelLayout>
  trackData: GsapClipTrack
  sequenceVariant: string
}> = ({leaf, layoutP, trackData, sequenceVariant}) => {
  const fromUnitSpace = useVal(layoutP.scaledSpace.fromUnitSpace)

  const leftPx = fromUnitSpace(trackData.start)
  const widthPx = Math.max(
    fromUnitSpace(trackData.start + trackData.duration) - leftPx,
    4,
  )

  const [barRef, barNode] = useRefAndState<HTMLDivElement | null>(null)
  const [startHandleRef, startHandleNode] =
    useRefAndState<HTMLDivElement | null>(null)
  const [endHandleRef, endHandleNode] = useRefAndState<HTMLDivElement | null>(
    null,
  )

  const [contextMenu] = useGsapClipContextMenu(barNode, {
    leaf,
    sequenceVariant,
  })

  const moveOpts: DragOpts = useMemo(() => {
    let temp: CommitOrDiscard | undefined
    const startAtDrag = trackData.start
    const toUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
    return {
      debugName: 'gsapClipMove',
      lockCSSCursorTo: 'ew-resize',
      onDragStart() {
        return {
          onDrag(dx: number) {
            const delta = toUnitSpace(dx)
            temp?.discard()
            const nextStart = Math.max(0, startAtDrag + delta)
            temp = getStudio()!.tempTransaction(({stateEditors}) => {
              stateEditors.coreByProject.historic.sheetsById.sequence.setGsapClipTrackTiming(
                {
                  ...leaf.sheetObject.address,
                  trackId: leaf.trackId,
                  start: nextStart,
                  sequenceVariant,
                },
              )
            })
            previewGsapClipsAtCurrentPlayhead(leaf.sheetObject, {
              trackId: leaf.trackId,
              start: nextStart,
              duration: trackData.duration,
            })
          },
          onDragEnd(dragHappened) {
            if (dragHappened) temp?.commit()
            else temp?.discard()
            temp = undefined
          },
        }
      },
    }
  }, [leaf, layoutP, sequenceVariant, trackData.start])

  const resizeStartOpts: DragOpts = useMemo(() => {
    let temp: CommitOrDiscard | undefined
    const startAtDrag = trackData.start
    const durationAtDrag = trackData.duration
    const toUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
    return {
      debugName: 'gsapClipResizeStart',
      lockCSSCursorTo: 'ew-resize',
      onDragStart() {
        return {
          onDrag(dx: number) {
            const delta = toUnitSpace(dx)
            const newStart = Math.max(0, startAtDrag + delta)
            const newDuration = Math.max(0.01, durationAtDrag - delta)
            temp?.discard()
            temp = getStudio()!.tempTransaction(({stateEditors}) => {
              stateEditors.coreByProject.historic.sheetsById.sequence.setGsapClipTrackTiming(
                {
                  ...leaf.sheetObject.address,
                  trackId: leaf.trackId,
                  start: newStart,
                  duration: newDuration,
                  sequenceVariant,
                },
              )
            })
            previewGsapClipsAtCurrentPlayhead(leaf.sheetObject, {
              trackId: leaf.trackId,
              start: newStart,
              duration: newDuration,
            })
          },
          onDragEnd(dragHappened) {
            if (dragHappened) temp?.commit()
            else temp?.discard()
            temp = undefined
          },
        }
      },
    }
  }, [leaf, layoutP, sequenceVariant, trackData.duration, trackData.start])

  const resizeEndOpts: DragOpts = useMemo(() => {
    let temp: CommitOrDiscard | undefined
    const startDuration = trackData.duration
    const toUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
    return {
      debugName: 'gsapClipResize',
      lockCSSCursorTo: 'ew-resize',
      onDragStart() {
        return {
          onDrag(dx: number) {
            const newDuration = Math.max(0.01, startDuration + toUnitSpace(dx))
            temp?.discard()
            temp = getStudio()!.tempTransaction(({stateEditors}) => {
              stateEditors.coreByProject.historic.sheetsById.sequence.setGsapClipTrackTiming(
                {
                  ...leaf.sheetObject.address,
                  trackId: leaf.trackId,
                  duration: newDuration,
                  sequenceVariant,
                },
              )
            })
            previewGsapClipsAtCurrentPlayhead(leaf.sheetObject, {
              trackId: leaf.trackId,
              start: trackData.start,
              duration: newDuration,
            })
          },
          onDragEnd(dragHappened) {
            if (dragHappened) temp?.commit()
            else temp?.discard()
            temp = undefined
          },
        }
      },
    }
  }, [leaf, sequenceVariant, trackData.duration, layoutP])

  const [isDraggingMove] = useDrag(barNode, moveOpts)
  const [isDraggingStart] = useDrag(startHandleNode, resizeStartOpts)
  const [isDraggingEnd] = useDrag(endHandleNode, resizeEndOpts)
  useCssCursorLock(
    isDraggingMove || isDraggingStart || isDraggingEnd,
    'draggingGsapClip',
    'ew-resize',
  )

  return (
    <Container>
      {contextMenu}
      <ClipBar
        ref={barRef}
        style={{left: leftPx, width: widthPx}}
        title={trackData.gsapAnimationId}
      >
        <EdgeHandle ref={startHandleRef} $side="left" />
        <EdgeHandle ref={endHandleRef} $side="right" />
      </ClipBar>
    </Container>
  )
}

function useGsapClipContextMenu(
  node: HTMLDivElement | null,
  opts: {
    leaf: SequenceEditorTree_GsapClipTrack
    sequenceVariant: string
  },
) {
  return useContextMenu(node, {
    displayName: 'GSAP clip',
    menuItems: (): IContextMenuItem[] => [
      {
        type: 'normal',
        label: 'Remove from sequence',
        callback: () => {
          getStudio().transaction(({stateEditors}) => {
            stateEditors.coreByProject.historic.sheetsById.sequence.deleteGsapClipTrack(
              {
                ...opts.leaf.sheetObject.address,
                trackId: opts.leaf.trackId,
                sequenceVariant: opts.sequenceVariant,
              },
            )
          })
        },
      },
    ],
  })
}

export default GsapClipTrackRow
