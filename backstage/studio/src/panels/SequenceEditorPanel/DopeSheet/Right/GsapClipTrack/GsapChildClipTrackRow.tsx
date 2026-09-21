import type {SequenceEditorPanelLayout} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_GsapChildClip} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@unseenco/backstage/react'
import type {Pointer} from '@unseenco/backstage/dataverse'
import {val} from '@unseenco/backstage/dataverse'
import React, {useCallback, useMemo} from 'react'
import styled from 'styled-components'
import RightRow from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/Right/Row'
import getStudio from '@unseenco/backstage/studio/getStudio'
import type {DragOpts} from '@unseenco/backstage/studio/uiComponents/useDrag'
import useDrag from '@unseenco/backstage/studio/uiComponents/useDrag'
import {useCssCursorLock} from '@unseenco/backstage/studio/uiComponents/PointerEventsHandler'
import type {CommitOrDiscard} from '@unseenco/backstage/studio/StudioStore/StudioStore'
import useRefAndState from '@unseenco/backstage/studio/utils/useRefAndState'
import useContextMenu from '@unseenco/backstage/studio/uiComponents/simpleContextMenu/useContextMenu'
import type {IContextMenuItem} from '@unseenco/backstage/studio/uiComponents/simpleContextMenu/useContextMenu'
import DopeSnap from '@unseenco/backstage/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'
import {
  collectSequenceEditorSnapPositions,
  snapToNone,
  snapToSome,
} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/Right/KeyframeSnapTarget'
import {valTracksByObjectForSheetVariant} from '@unseenco/backstage/studio/utils/sequenceVariantHelpers'
import {getSequenceStateFromSheet} from '@unseenco/backstage/studio/utils/sequenceVariantHelpers'
import {previewGsapClipsAtCurrentPlayhead} from '@unseenco/backstage/studio/gsap/previewGsapClipsAtPlayhead'
import {gsapClipBarLayoutInScaledSpace} from './gsapClipBarLayout'
import {gsapTimelineChildClipInSequenceSpace} from './gsapTimelineChildBarLayout'
import {
  applyTimelineChildTimingToGsap,
  readTimelineSpanSeconds,
} from '@unseenco/backstage-shared/gsap/applyTimelineChildTiming'
import {getAnimationEntry} from '@unseenco/backstage-shared/gsap/gsapAnimationRegistry'
import {
  gsapTimelineChildTimingDeviatesFromBaseline,
  resolveGsapClipBaselineTiming,
} from '@unseenco/backstage-shared/gsap/gsapClipBaseline'
import {selectSheetObjectInOutline} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/selectSheetObjectInOutline'
import {shouldDeferToDopeSheetMarqueeSelection} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/shouldDeferToDopeSheetMarqueeSelection'

const Container = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`

const ClipBar = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 10px;
  border-radius: 2px;
  background: var(--sequencer-clip-gsap-child-bg, #4d6b52);
  border: 1px solid var(--sequencer-clip-gsap-child-border, #6b8f71);
  box-sizing: border-box;
  cursor: grab;
`

const EdgeHandle = styled.div<{$side: 'left' | 'right'}>`
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 10px;
  cursor: ew-resize;
  z-index: 1;
  ${(props) => (props.$side === 'left' ? 'left: 0;' : 'right: 0;')}

  &::after {
    content: '';
    position: absolute;
    top: 5px;
    bottom: 5px;
    width: 2px;
    border-radius: 1px;
    background: rgba(255, 255, 255, 0.35);
    ${(props) => (props.$side === 'left' ? 'left: 3px;' : 'right: 3px;')}
  }
`

const GsapChildClipTrackRow: React.VFC<{
  leaf: SequenceEditorTree_GsapChildClip
  layoutP: Pointer<SequenceEditorPanelLayout>
  sequenceVariant: string
}> = ({leaf, layoutP, sequenceVariant}) => {
  return usePrism(() => {
    const node = (
      <GsapChildClipBar
        leaf={leaf}
        layoutP={layoutP}
        sequenceVariant={sequenceVariant}
      />
    )
    return (
      <RightRow layoutP={layoutP} leaf={leaf} isCollapsed={false} node={node} />
    )
  }, [leaf, layoutP, sequenceVariant])
}

const GsapChildClipBar: React.VFC<{
  leaf: SequenceEditorTree_GsapChildClip
  layoutP: Pointer<SequenceEditorPanelLayout>
  sequenceVariant: string
}> = ({leaf, layoutP, sequenceVariant}) => {
  const parent = leaf.parentTrackData
  const timelineSpan = parent.timelineSpan ?? parent.duration
  const seqClip = gsapTimelineChildClipInSequenceSpace(
    parent,
    leaf.childData,
    timelineSpan,
  )

  const scaledSpace = usePrism(
    () => ({
      fromUnitSpace: val(layoutP.scaledSpace.fromUnitSpace),
      leftPadding: val(layoutP.scaledSpace.leftPadding),
    }),
    [layoutP],
  )

  const {leftPx, widthPx} = gsapClipBarLayoutInScaledSpace(seqClip, scaledSpace)

  const [barRef, barNode] = useRefAndState<HTMLDivElement | null>(null)
  const [startHandleRef, startHandleNode] =
    useRefAndState<HTMLDivElement | null>(null)
  const [endHandleRef, endHandleNode] = useRefAndState<HTMLDivElement | null>(
    null,
  )

  const [contextMenu] = useGsapChildClipContextMenu(barNode, {
    leaf,
    sequenceVariant,
  })

  const beginSnapTargets = useCallback(() => {
    const sheetStatePointer =
      getStudio()!.atomP.historic.coreByProject[
        leaf.sheetObject.address.projectId
      ].sheetsById[leaf.sheetObject.address.sheetId]
    const tracksByObject =
      valTracksByObjectForSheetVariant(sheetStatePointer, sequenceVariant) ?? {}

    snapToSome(
      collectSequenceEditorSnapPositions(tracksByObject, {
        shouldIncludeKeyframe() {
          return true
        },
        shouldIncludeGsapClip(_clip, {trackId}) {
          return trackId !== leaf.parentTrackId
        },
      }),
    )
  }, [leaf, sequenceVariant])

  const commitChildTimingToGsap = useCallback(() => {
    const entry = getAnimationEntry(leaf.sheetObject)
    if (!entry?.animation) return
    const sheetState = val(
      getStudio()!.atomP.historic.coreByProject[
        leaf.sheetObject.address.projectId
      ].sheetsById[leaf.sheetObject.address.sheetId],
    )
    const track = getSequenceStateFromSheet(sheetState, sequenceVariant)
      ?.tracksByObject[leaf.sheetObject.address.objectKey]?.trackData[
      leaf.parentTrackId
    ]
    if (!track || track.type !== 'GsapClipTrack') return
    applyTimelineChildTimingToGsap(
      entry.animation,
      track.timelineChildren ?? [],
      entry.timelineChildById,
    )
    const newSpan = readTimelineSpanSeconds(
      entry.animation,
      track.timelineSpan ?? parent.duration,
    )
    getStudio().transaction(({stateEditors}) => {
      stateEditors.coreByProject.historic.sheetsById.sequence.setGsapTimelineChildTiming(
        {
          ...leaf.sheetObject.address,
          trackId: leaf.parentTrackId,
          childId: leaf.childId,
          timelineSpan: newSpan,
          parentDuration: Math.max(newSpan, track.duration),
          sequenceVariant,
        },
      )
    })
  }, [leaf, parent.duration, sequenceVariant])

  const moveOpts: DragOpts = useMemo(() => {
    let temp: CommitOrDiscard | undefined
    const localStartAtDrag = leaf.childData.localStart
    const toUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
    return {
      debugName: 'gsapChildClipMove',
      onDragStart(event) {
        if (shouldDeferToDopeSheetMarqueeSelection(event)) {
          return false
        }
        selectSheetObjectInOutline(leaf.sheetObject)
        beginSnapTargets()
        return {
          onDrag(dx: number, _dy: number, event: MouseEvent) {
            const deltaSeq = toUnitSpace(dx)
            temp?.discard()
            const snappedSeqStart =
              DopeSnap.checkIfMouseEventSnapToPos(event, {
                ignore: barNode,
              }) ?? seqClip.start + deltaSeq
            const newLocalStart = Math.max(
              0,
              localStartAtDrag +
                ((snappedSeqStart - seqClip.start) / parent.duration) *
                  timelineSpan,
            )
            temp = getStudio()!.tempTransaction(({stateEditors}) => {
              stateEditors.coreByProject.historic.sheetsById.sequence.setGsapTimelineChildTiming(
                {
                  ...leaf.sheetObject.address,
                  trackId: leaf.parentTrackId,
                  childId: leaf.childId,
                  localStart: newLocalStart,
                  sequenceVariant,
                },
              )
            })
            previewGsapClipsAtCurrentPlayhead(leaf.sheetObject)
          },
          onDragEnd(dragHappened) {
            if (dragHappened) {
              temp?.commit()
              commitChildTimingToGsap()
            } else temp?.discard()
            temp = undefined
            snapToNone()
          },
        }
      },
    }
  }, [
    barNode,
    beginSnapTargets,
    commitChildTimingToGsap,
    leaf,
    layoutP,
    parent.duration,
    seqClip.start,
    sequenceVariant,
    timelineSpan,
  ])

  const resizeStartOpts: DragOpts = useMemo(() => {
    let temp: CommitOrDiscard | undefined
    const localStartAtDrag = leaf.childData.localStart
    const localDurationAtDrag = leaf.childData.localDuration
    const toUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
    return {
      debugName: 'gsapChildClipResizeStart',
      onDragStart(event) {
        if (shouldDeferToDopeSheetMarqueeSelection(event)) {
          return false
        }
        selectSheetObjectInOutline(leaf.sheetObject)
        beginSnapTargets()
        return {
          onDrag(dx: number) {
            const deltaLocal =
              parent.duration <= 0
                ? 0
                : (toUnitSpace(dx) / parent.duration) * timelineSpan
            const newLocalStart = Math.max(0, localStartAtDrag + deltaLocal)
            const newLocalDuration = Math.max(
              0.01,
              localDurationAtDrag - deltaLocal,
            )
            temp?.discard()
            temp = getStudio()!.tempTransaction(({stateEditors}) => {
              stateEditors.coreByProject.historic.sheetsById.sequence.setGsapTimelineChildTiming(
                {
                  ...leaf.sheetObject.address,
                  trackId: leaf.parentTrackId,
                  childId: leaf.childId,
                  localStart: newLocalStart,
                  localDuration: newLocalDuration,
                  sequenceVariant,
                },
              )
            })
            previewGsapClipsAtCurrentPlayhead(leaf.sheetObject)
          },
          onDragEnd(dragHappened) {
            if (dragHappened) {
              temp?.commit()
              commitChildTimingToGsap()
            } else temp?.discard()
            temp = undefined
            snapToNone()
          },
        }
      },
    }
  }, [
    beginSnapTargets,
    commitChildTimingToGsap,
    leaf,
    layoutP,
    parent.duration,
    sequenceVariant,
    timelineSpan,
  ])

  const resizeEndOpts: DragOpts = useMemo(() => {
    let temp: CommitOrDiscard | undefined
    const toUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
    return {
      debugName: 'gsapChildClipResizeEnd',
      onDragStart(event) {
        if (shouldDeferToDopeSheetMarqueeSelection(event)) {
          return false
        }
        selectSheetObjectInOutline(leaf.sheetObject)
        beginSnapTargets()
        return {
          onDrag(dx: number, _dy: number, event: MouseEvent) {
            const snappedEnd = DopeSnap.checkIfMouseEventSnapToPos(event, {
              ignore: endHandleNode,
            })
            const newSeqDuration =
              snappedEnd != null
                ? snappedEnd - seqClip.start
                : seqClip.duration + toUnitSpace(dx)
            const newLocalDuration = Math.max(
              0.01,
              (newSeqDuration / parent.duration) * timelineSpan,
            )
            temp?.discard()
            temp = getStudio()!.tempTransaction(({stateEditors}) => {
              stateEditors.coreByProject.historic.sheetsById.sequence.setGsapTimelineChildTiming(
                {
                  ...leaf.sheetObject.address,
                  trackId: leaf.parentTrackId,
                  childId: leaf.childId,
                  localDuration: newLocalDuration,
                  sequenceVariant,
                },
              )
            })
            previewGsapClipsAtCurrentPlayhead(leaf.sheetObject)
          },
          onDragEnd(dragHappened) {
            if (dragHappened) {
              temp?.commit()
              commitChildTimingToGsap()
            } else temp?.discard()
            temp = undefined
            snapToNone()
          },
        }
      },
    }
  }, [
    beginSnapTargets,
    commitChildTimingToGsap,
    endHandleNode,
    leaf,
    layoutP,
    parent.duration,
    seqClip.duration,
    seqClip.start,
    sequenceVariant,
    timelineSpan,
  ])

  const [isDraggingMove] = useDrag(barNode, moveOpts)
  const [isDraggingStart] = useDrag(startHandleNode, resizeStartOpts)
  const [isDraggingEnd] = useDrag(endHandleNode, resizeEndOpts)
  const isDragging = isDraggingMove || isDraggingStart || isDraggingEnd
  useCssCursorLock(
    isDragging,
    'draggingGsapClip draggingPositionInSequenceEditor',
    'ew-resize',
  )

  return (
    <Container>
      {contextMenu}
      <ClipBar ref={barRef} style={{left: leftPx, width: widthPx}}>
        <EdgeHandle ref={startHandleRef} $side="left" />
        <EdgeHandle ref={endHandleRef} $side="right" />
      </ClipBar>
    </Container>
  )
}

function useGsapChildClipContextMenu(
  node: HTMLDivElement | null,
  opts: {
    leaf: SequenceEditorTree_GsapChildClip
    sequenceVariant: string
  },
) {
  return useContextMenu(node, {
    displayName: 'GSAP child clip',
    menuItems: (): IContextMenuItem[] => {
      const sheetState = val(
        getStudio()!.atomP.historic.coreByProject[
          opts.leaf.sheetObject.address.projectId
        ].sheetsById[opts.leaf.sheetObject.address.sheetId],
      )
      const track = getSequenceStateFromSheet(sheetState, opts.sequenceVariant)
        ?.tracksByObject[opts.leaf.sheetObject.address.objectKey]?.trackData[
        opts.leaf.parentTrackId
      ]
      if (track?.type !== 'GsapClipTrack') {
        return []
      }
      const entry = getAnimationEntry(
        opts.leaf.sheetObject,
        track.gsapAnimationId,
      )
      const baseline = resolveGsapClipBaselineTiming(track, entry)
      if (
        !baseline ||
        !gsapTimelineChildTimingDeviatesFromBaseline(
          track,
          opts.leaf.childId,
          baseline,
        )
      ) {
        return []
      }
      return [
        {
          type: 'normal',
          label: 'Reset to original state',
          callback: () => {
            const address = {
              ...opts.leaf.sheetObject.address,
              trackId: opts.leaf.parentTrackId,
              childId: opts.leaf.childId,
              sequenceVariant: opts.sequenceVariant,
            }
            let didReset = false
            getStudio().transaction(({stateEditors}) => {
              didReset =
                stateEditors.coreByProject.historic.sheetsById.sequence.resetGsapTimelineChildToOriginal(
                  address,
                )
            })
            if (!didReset) return
            const sheetStateAfter = val(
              getStudio()!.atomP.historic.coreByProject[
                opts.leaf.sheetObject.address.projectId
              ].sheetsById[opts.leaf.sheetObject.address.sheetId],
            )
            const trackAfter = getSequenceStateFromSheet(
              sheetStateAfter,
              opts.sequenceVariant,
            )?.tracksByObject[opts.leaf.sheetObject.address.objectKey]
              ?.trackData[opts.leaf.parentTrackId]
            if (trackAfter?.type === 'GsapClipTrack') {
              const entryAfter = getAnimationEntry(
                opts.leaf.sheetObject,
                trackAfter.gsapAnimationId,
              )
              if (entryAfter?.animation) {
                applyTimelineChildTimingToGsap(
                  entryAfter.animation,
                  trackAfter.timelineChildren ?? [],
                  entryAfter.timelineChildById,
                  entryAfter.onRebuildTimeline,
                )
              }
            }
            previewGsapClipsAtCurrentPlayhead(opts.leaf.sheetObject)
          },
        },
      ]
    },
  })
}

export default GsapChildClipTrackRow
