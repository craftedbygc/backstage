import type {SequenceEditorPanelLayout} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorAggregateViewModel} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/sequenceEditorAggregateViewModel'
import {sequenceEditorAggregateViewModelSheetAddress} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/sequenceEditorAggregateViewModel'
import type {AggregatedKeyframes} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import {useVal} from '@unseenco/backstage/react'
import type {Pointer} from '@unseenco/backstage/dataverse'
import {val} from '@unseenco/backstage/dataverse'
import React, {useCallback, useMemo} from 'react'
import {
  SequencerClipBar,
  SequencerClipBarEdgeHandle,
  SequencerClipBarLabel,
} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/Right/keyframeRowUI/sequencerClipBarStyles'
import {
  aggregateKeyframeSpanBarLayoutInScaledSpace,
  aggregateKeyframeSpanInUnitSpace,
} from './aggregateKeyframeSpanLayout'
import {sequenceEditorAggregateTrackBarLabel} from './sequenceEditorAggregateTrackBarLabel'
import useRefAndState from '@unseenco/backstage/studio/utils/useRefAndState'
import type {DragOpts} from '@unseenco/backstage/studio/uiComponents/useDrag'
import useDrag from '@unseenco/backstage/studio/uiComponents/useDrag'
import {useCssCursorLock} from '@unseenco/backstage/studio/uiComponents/PointerEventsHandler'
import {useLockFrameStampPositionRef} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import DopeSnap from '@unseenco/backstage/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'
import {
  collectSequenceEditorSnapPositions,
  snapToNone,
  snapToSome,
} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/Right/KeyframeSnapTarget'
import {valTracksByObjectForSheetVariant} from '@unseenco/backstage/studio/utils/sequenceVariantHelpers'
import getStudio from '@unseenco/backstage/studio/getStudio'
import type {CommitOrDiscard} from '@unseenco/backstage/studio/StudioStore/StudioStore'
import {
  getStudioActiveSequenceVariant,
  getStudioSequence,
} from '@unseenco/backstage/studio/utils/activeSequenceVariant'
import {
  allKeyframeWithTracksInAggregate,
  applyAggregateKeyframePositionDelta,
  applyAggregateSpanScaleFromDragStart,
  aggregateSpanEnd,
  aggregateSpanScaleFromFixedEnd,
  aggregateSpanScaleFromFixedStart,
  clampAggregateSpanResizeEnd,
  clampAggregateSpanResizeStart,
  limitAggregateSpanMoveDelta,
} from './aggregateKeyframeSpanDrag'
import {selectSheetObjectInOutlineForAggregateViewModel} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/selectSheetObjectInOutline'
import {shouldDeferToDopeSheetMarqueeSelection} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/shouldDeferToDopeSheetMarqueeSelection'

const AggregateKeyframeSpanBar: React.VFC<{
  viewModel: SequenceEditorAggregateViewModel
  aggregatedKeyframes: AggregatedKeyframes
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({viewModel, aggregatedKeyframes, layoutP}) => {
  const scaledSpace = useVal(layoutP.scaledSpace)
  const sheet = useVal(layoutP.sheet)
  const layout = useMemo(
    () =>
      aggregateKeyframeSpanBarLayoutInScaledSpace(
        aggregatedKeyframes,
        scaledSpace,
      ),
    [aggregatedKeyframes, scaledSpace],
  )
  const label = useMemo(
    () => sequenceEditorAggregateTrackBarLabel(viewModel),
    [viewModel],
  )

  const span = useMemo(
    () => aggregateKeyframeSpanInUnitSpace(aggregatedKeyframes),
    [aggregatedKeyframes],
  )

  const [barRef, barNode] = useRefAndState<HTMLDivElement | null>(null)
  const [startHandleRef, startHandleNode] =
    useRefAndState<HTMLDivElement | null>(null)
  const [endHandleRef, endHandleNode] = useRefAndState<HTMLDivElement | null>(
    null,
  )

  const frameStampLock = useLockFrameStampPositionRef()
  const sheetAddress = sequenceEditorAggregateViewModelSheetAddress(viewModel)
  const sequenceVariant = getStudioActiveSequenceVariant(sheetAddress)
  const sequence = getStudioSequence(sheet)
  const snappingFunction = sequence.closestGridPosition

  const allKeyframes = useMemo(
    () => allKeyframeWithTracksInAggregate(aggregatedKeyframes),
    [aggregatedKeyframes],
  )

  const beginSnapTargets = useCallback(() => {
    const sheetStatePointer =
      getStudio()!.atomP.historic.coreByProject[sheetAddress.projectId]
        .sheetsById[sheetAddress.sheetId]
    const tracksByObject =
      valTracksByObjectForSheetVariant(sheetStatePointer, sequenceVariant) ?? {}

    const draggedIds = new Set(allKeyframes.map(({kf}) => kf.id))

    snapToSome(
      collectSequenceEditorSnapPositions(tracksByObject, {
        shouldIncludeKeyframe(keyframe) {
          return !draggedIds.has(keyframe.id)
        },
      }),
    )
  }, [allKeyframes, sequenceVariant, sheetAddress])

  const moveOpts: DragOpts = useMemo(() => {
    if (!span) {
      return {debugName: 'aggregateSpanBarMove', onDragStart: () => false}
    }
    let temp: CommitOrDiscard | undefined
    const startAtDrag = span.start
    const toUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
    return {
      debugName: 'aggregateSpanBarMove',
      onDragStart(event: MouseEvent) {
        if (shouldDeferToDopeSheetMarqueeSelection(event)) {
          return false
        }
        selectSheetObjectInOutlineForAggregateViewModel(viewModel)
        beginSnapTargets()
        return {
          onDrag(dx: number, _dy: number, event: MouseEvent) {
            const deltaRaw = toUnitSpace(dx)
            const snappedStart =
              DopeSnap.checkIfMouseEventSnapToPos(event, {
                ignore: barNode,
              }) ?? startAtDrag + deltaRaw
            const delta = limitAggregateSpanMoveDelta(
              allKeyframes,
              snappedStart - startAtDrag,
            )
            frameStampLock(true, startAtDrag + delta)
            temp?.discard()
            temp = applyAggregateKeyframePositionDelta(
              allKeyframes,
              delta,
              sheet,
              sequenceVariant,
              snappingFunction,
            )
          },
          onDragEnd(dragHappened: boolean) {
            frameStampLock(false, -1)
            if (dragHappened) temp?.commit()
            else temp?.discard()
            temp = undefined
            snapToNone()
          },
        }
      },
    }
  }, [
    allKeyframes,
    barNode,
    beginSnapTargets,
    frameStampLock,
    layoutP,
    sheet,
    sequenceVariant,
    snappingFunction,
    span,
  ])

  const resizeStartOpts: DragOpts = useMemo(() => {
    if (!span) {
      return {
        debugName: 'aggregateSpanBarResizeStart',
        onDragStart: () => false,
      }
    }
    let temp: CommitOrDiscard | undefined
    const spanStartAtDrag = span.start
    const spanEndAtDrag = aggregateSpanEnd(span)
    const toUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
    return {
      debugName: 'aggregateSpanBarResizeStart',
      onDragStart(event: MouseEvent) {
        if (shouldDeferToDopeSheetMarqueeSelection(event)) {
          return false
        }
        selectSheetObjectInOutlineForAggregateViewModel(viewModel)
        const keyframesAtDragStart =
          allKeyframeWithTracksInAggregate(aggregatedKeyframes)
        beginSnapTargets()
        return {
          onDrag(dx: number, _dy: number, event: MouseEvent) {
            const newStartRaw =
              DopeSnap.checkIfMouseEventSnapToPos(event, {
                ignore: startHandleNode,
              }) ?? spanStartAtDrag + toUnitSpace(dx)
            const newStart = clampAggregateSpanResizeStart(
              Math.max(0, newStartRaw),
              spanEndAtDrag,
              sheet,
            )
            frameStampLock(true, newStart)
            temp?.discard()
            const oldDuration = spanEndAtDrag - spanStartAtDrag
            if (oldDuration === 0) {
              temp = applyAggregateKeyframePositionDelta(
                keyframesAtDragStart,
                newStart - spanStartAtDrag,
                sheet,
                sequenceVariant,
                snappingFunction,
              )
              return
            }
            const scale = aggregateSpanScaleFromFixedEnd(
              spanStartAtDrag,
              spanEndAtDrag,
              newStart,
            )
            temp = applyAggregateSpanScaleFromDragStart(
              keyframesAtDragStart,
              spanEndAtDrag,
              scale,
              sheet,
              sequenceVariant,
              snappingFunction,
            )
          },
          onDragEnd(dragHappened: boolean) {
            frameStampLock(false, -1)
            if (dragHappened) temp?.commit()
            else temp?.discard()
            temp = undefined
            snapToNone()
          },
        }
      },
    }
  }, [
    aggregatedKeyframes,
    beginSnapTargets,
    frameStampLock,
    layoutP,
    sheet,
    sequenceVariant,
    snappingFunction,
    span,
    startHandleNode,
  ])

  const resizeEndOpts: DragOpts = useMemo(() => {
    if (!span) {
      return {debugName: 'aggregateSpanBarResizeEnd', onDragStart: () => false}
    }
    let temp: CommitOrDiscard | undefined
    const spanStartAtDrag = span.start
    const spanEndAtDrag = aggregateSpanEnd(span)
    const toUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
    return {
      debugName: 'aggregateSpanBarResizeEnd',
      onDragStart(event: MouseEvent) {
        if (shouldDeferToDopeSheetMarqueeSelection(event)) {
          return false
        }
        selectSheetObjectInOutlineForAggregateViewModel(viewModel)
        const keyframesAtDragStart =
          allKeyframeWithTracksInAggregate(aggregatedKeyframes)
        beginSnapTargets()
        return {
          onDrag(dx: number, _dy: number, event: MouseEvent) {
            const snappedEnd = DopeSnap.checkIfMouseEventSnapToPos(event, {
              ignore: endHandleNode,
            })
            const newEnd = clampAggregateSpanResizeEnd(
              spanStartAtDrag,
              snappedEnd ?? spanEndAtDrag + toUnitSpace(dx),
              sheet,
            )
            frameStampLock(true, newEnd)
            temp?.discard()
            const oldDuration = spanEndAtDrag - spanStartAtDrag
            if (oldDuration === 0) {
              temp = applyAggregateKeyframePositionDelta(
                keyframesAtDragStart,
                newEnd - spanEndAtDrag,
                sheet,
                sequenceVariant,
                snappingFunction,
              )
              return
            }
            const scale = aggregateSpanScaleFromFixedStart(
              spanStartAtDrag,
              spanEndAtDrag,
              newEnd,
            )
            temp = applyAggregateSpanScaleFromDragStart(
              keyframesAtDragStart,
              spanStartAtDrag,
              scale,
              sheet,
              sequenceVariant,
              snappingFunction,
            )
          },
          onDragEnd(dragHappened: boolean) {
            frameStampLock(false, -1)
            if (dragHappened) temp?.commit()
            else temp?.discard()
            temp = undefined
            snapToNone()
          },
        }
      },
    }
  }, [
    aggregatedKeyframes,
    beginSnapTargets,
    endHandleNode,
    frameStampLock,
    layoutP,
    sheet,
    sequenceVariant,
    snappingFunction,
    span,
  ])

  const [isDraggingMove] = useDrag(barNode, moveOpts)
  const [isDraggingStart] = useDrag(startHandleNode, resizeStartOpts)
  const [isDraggingEnd] = useDrag(endHandleNode, resizeEndOpts)
  const isDraggingBar = isDraggingMove || isDraggingStart || isDraggingEnd
  useCssCursorLock(
    isDraggingBar,
    'draggingPositionInSequenceEditor',
    'ew-resize',
  )

  if (!layout || !span) {
    return null
  }

  return (
    <SequencerClipBar
      ref={barRef}
      $colorScheme="backstage"
      style={{left: layout.leftPx, width: layout.widthPx}}
      title={label}
    >
      <SequencerClipBarLabel>{label}</SequencerClipBarLabel>
      <SequencerClipBarEdgeHandle ref={startHandleRef} $side="left" />
      <SequencerClipBarEdgeHandle ref={endHandleRef} $side="right" />
    </SequencerClipBar>
  )
}

export default AggregateKeyframeSpanBar
