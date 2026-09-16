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

const ResizeHandle = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  cursor: ew-resize;
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
  const [endHandleRef, endHandleNode] = useRefAndState<HTMLDivElement | null>(
    null,
  )

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
            temp = getStudio()!.tempTransaction(({stateEditors}) => {
              stateEditors.coreByProject.historic.sheetsById.sequence.setGsapClipTrackTiming(
                {
                  ...leaf.sheetObject.address,
                  trackId: leaf.trackId,
                  start: Math.max(0, startAtDrag + delta),
                  sequenceVariant,
                },
              )
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
  const [isDraggingResize] = useDrag(endHandleNode, resizeEndOpts)
  useCssCursorLock(
    isDraggingMove || isDraggingResize,
    'draggingGsapClip',
    'ew-resize',
  )

  return (
    <Container>
      <ClipBar
        ref={barRef}
        style={{left: leftPx, width: widthPx}}
        title={trackData.gsapAnimationId}
      >
        <ResizeHandle ref={endHandleRef} />
      </ClipBar>
    </Container>
  )
}

export default GsapClipTrackRow
