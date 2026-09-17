import type {GsapClipTrack} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import type {SequenceEditorPanelLayout} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_GsapClipTrack} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism, useVal} from '@unseenco/theatre-react'
import DopeSnap from '@unseenco/theatre-studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'
import KeyframeSnapTarget, {
  collectSequenceEditorSnapPositions,
  gsapClipEdgeTimes,
  snapPositionsStateD,
  snapToNone,
  snapToSome,
} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/Right/KeyframeSnapTarget'
import type {Pointer} from '@unseenco/theatre-dataverse'
import {val} from '@unseenco/theatre-dataverse'
import React, {useCallback, useMemo} from 'react'
import styled from 'styled-components'
import RightRow from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/Right/Row'
import getStudio from '@unseenco/theatre-studio/getStudio'
import type {DragOpts} from '@unseenco/theatre-studio/uiComponents/useDrag'
import useDrag from '@unseenco/theatre-studio/uiComponents/useDrag'
import {useCssCursorLock} from '@unseenco/theatre-studio/uiComponents/PointerEventsHandler'
import type {CommitOrDiscard} from '@unseenco/theatre-studio/StudioStore/StudioStore'
import {getStudioActiveSequenceVariant} from '@unseenco/theatre-studio/utils/activeSequenceVariant'
import {
  getSequenceStateFromSheet,
  valTracksByObjectForSheetVariant,
} from '@unseenco/theatre-studio/utils/sequenceVariantHelpers'
import useRefAndState from '@unseenco/theatre-studio/utils/useRefAndState'
import useContextMenu from '@unseenco/theatre-studio/uiComponents/simpleContextMenu/useContextMenu'
import type {IContextMenuItem} from '@unseenco/theatre-studio/uiComponents/simpleContextMenu/useContextMenu'
import {applyGsapClipTrackToAnimation} from '@unseenco/theatre-studio/gsap/applyGsapClipTrackToAnimation'
import {previewGsapClipsAtCurrentPlayhead} from '@unseenco/theatre-studio/gsap/previewGsapClipsAtPlayhead'
import {gsapClipBarLayoutInScaledSpace} from './gsapClipBarLayout'
import GsapChildClipTrackRow from './GsapChildClipTrackRow'
import {getAnimationEntry} from '@unseenco/theatre-shared/gsap/gsapAnimationRegistry'
import {
  gsapClipTimingDeviatesFromBaseline,
  resolveGsapClipBaselineTiming,
} from '@unseenco/theatre-shared/gsap/gsapClipBaseline'

const Container = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`

const ClipBar = styled.div<{$isTimeline?: boolean}>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 14px;
  border-radius: 3px;
  background: ${(p) => (p.$isTimeline ? '#5a735e' : '#6b8f71')};
  border: 1px solid #8fb396;
  box-sizing: border-box;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`

const ClipBarLabel = styled.span`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.85);
  pointer-events: none;
  user-select: none;
  padding: 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
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

export const GsapClipTrackBarForTreeLeaf: React.VFC<{
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
      return <div />
    }

    return (
      <GsapClipTrackBar
        leaf={leaf}
        layoutP={layoutP}
        trackData={trackData}
        sequenceVariant={trackVariant}
        displayLabel={leaf.displayLabel}
      />
    )
  }, [leaf, layoutP])
}

const GsapClipTrackRow: React.VFC<{
  leaf: SequenceEditorTree_GsapClipTrack
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => {
  return usePrism(() => {
    const activeVariant = getStudioActiveSequenceVariant(
      leaf.sheetObject.sheet.address,
    )
    const trackVariant =
      leaf.sheetObject.template.getSequenceVariantOwningTrack(
        leaf.trackId,
        activeVariant,
      ) ?? activeVariant

    const node = <GsapClipTrackBarForTreeLeaf leaf={leaf} layoutP={layoutP} />

    return (
      <RightRow leaf={leaf} isCollapsed={leaf.isCollapsed} node={node}>
        {leaf.children.map((child) => (
          <GsapChildClipTrackRow
            key={child.childId}
            leaf={child}
            layoutP={layoutP}
            sequenceVariant={trackVariant}
          />
        ))}
      </RightRow>
    )
  }, [leaf, layoutP])
}

const GsapClipTrackBar: React.VFC<{
  leaf: SequenceEditorTree_GsapClipTrack
  layoutP: Pointer<SequenceEditorPanelLayout>
  trackData: GsapClipTrack
  sequenceVariant: string
  displayLabel: string
}> = ({leaf, layoutP, trackData, sequenceVariant, displayLabel}) => {
  const isTimeline = (trackData.timelineChildren?.length ?? 0) > 0
  const scaledSpace = usePrism(
    () => ({
      fromUnitSpace: val(layoutP.scaledSpace.fromUnitSpace),
      leftPadding: val(layoutP.scaledSpace.leftPadding),
    }),
    [layoutP],
  )
  const snapPositionsState = useVal(snapPositionsStateD)

  const snapPositions =
    (snapPositionsState.mode === 'snapToSome'
      ? snapPositionsState.positions[leaf.sheetObject.address.objectKey]?.[
          leaf.trackId
        ]
      : undefined) ?? []

  const snapToAllClipEdges = snapPositionsState.mode === 'snapToAll'
  const ownClipEdgePositions = gsapClipEdgeTimes(trackData)

  const {leftPx, widthPx} = gsapClipBarLayoutInScaledSpace(
    trackData,
    scaledSpace,
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

  const beginGsapClipSnapTargets = useCallback(() => {
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
          return trackId !== leaf.trackId
        },
      }),
    )
  }, [leaf, sequenceVariant])

  const moveOpts: DragOpts = useMemo(() => {
    let temp: CommitOrDiscard | undefined
    const startAtDrag = trackData.start
    const toUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
    return {
      debugName: 'gsapClipMove',
      onDragStart() {
        beginGsapClipSnapTargets()
        return {
          onDrag(dx: number, _dy: number, event: MouseEvent) {
            const delta = toUnitSpace(dx)
            temp?.discard()
            const nextStart = Math.max(
              0,
              DopeSnap.checkIfMouseEventSnapToPos(event, {
                ignore: barNode,
              }) ?? startAtDrag + delta,
            )
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
            snapToNone()
          },
        }
      },
    }
  }, [
    barNode,
    beginGsapClipSnapTargets,
    leaf,
    layoutP,
    sequenceVariant,
    trackData.duration,
    trackData.start,
  ])

  const resizeStartOpts: DragOpts = useMemo(() => {
    let temp: CommitOrDiscard | undefined
    const startAtDrag = trackData.start
    const durationAtDrag = trackData.duration
    const toUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
    return {
      debugName: 'gsapClipResizeStart',
      onDragStart() {
        beginGsapClipSnapTargets()
        return {
          onDrag(dx: number, _dy: number, event: MouseEvent) {
            const delta = toUnitSpace(dx)
            const newStart = Math.max(
              0,
              DopeSnap.checkIfMouseEventSnapToPos(event, {
                ignore: startHandleNode,
              }) ?? startAtDrag + delta,
            )
            const newDuration = Math.max(
              0.01,
              durationAtDrag - (newStart - startAtDrag),
            )
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
            snapToNone()
          },
        }
      },
    }
  }, [
    beginGsapClipSnapTargets,
    leaf,
    layoutP,
    sequenceVariant,
    startHandleNode,
    trackData.duration,
    trackData.start,
  ])

  const resizeEndOpts: DragOpts = useMemo(() => {
    let temp: CommitOrDiscard | undefined
    const startDuration = trackData.duration
    const clipStart = trackData.start
    const toUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
    return {
      debugName: 'gsapClipResize',
      onDragStart() {
        beginGsapClipSnapTargets()
        return {
          onDrag(dx: number, _dy: number, event: MouseEvent) {
            const snappedEnd = DopeSnap.checkIfMouseEventSnapToPos(event, {
              ignore: endHandleNode,
            })
            const newDuration = Math.max(
              0.01,
              snappedEnd != null
                ? snappedEnd - clipStart
                : startDuration + toUnitSpace(dx),
            )
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
              start: clipStart,
              duration: newDuration,
            })
          },
          onDragEnd(dragHappened) {
            if (dragHappened) temp?.commit()
            else temp?.discard()
            temp = undefined
            snapToNone()
          },
        }
      },
    }
  }, [
    beginGsapClipSnapTargets,
    endHandleNode,
    leaf,
    layoutP,
    sequenceVariant,
    trackData.duration,
    trackData.start,
  ])

  const [isDraggingMove] = useDrag(barNode, moveOpts)
  const [isDraggingStart] = useDrag(startHandleNode, resizeStartOpts)
  const [isDraggingEnd] = useDrag(endHandleNode, resizeEndOpts)
  const isDraggingClip = isDraggingMove || isDraggingStart || isDraggingEnd
  useCssCursorLock(
    isDraggingClip,
    'draggingGsapClip draggingPositionInSequenceEditor',
    'ew-resize',
  )

  const snapTargets = snapPositions.map((position) => (
    <KeyframeSnapTarget
      key={`gsap-snap-target-${position}`}
      layoutP={layoutP}
      leaf={leaf}
      position={position}
    />
  ))

  const additionalSnapTargets = !snapToAllClipEdges
    ? null
    : ownClipEdgePositions.map((position) => (
        <KeyframeSnapTarget
          key={`gsap-additional-snap-target-${position}`}
          layoutP={layoutP}
          leaf={leaf}
          position={position}
        />
      ))

  return (
    <Container>
      {snapTargets}
      {additionalSnapTargets}
      {contextMenu}
      <ClipBar
        ref={barRef}
        style={{left: leftPx, width: widthPx}}
        title={trackData.gsapAnimationId}
        $isTimeline={isTimeline}
      >
        <ClipBarLabel>{displayLabel}</ClipBarLabel>
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
    menuItems: (): IContextMenuItem[] => {
      const sheetState = val(
        getStudio()!.atomP.historic.coreByProject[
          opts.leaf.sheetObject.address.projectId
        ].sheetsById[opts.leaf.sheetObject.address.sheetId],
      )
      const track = getSequenceStateFromSheet(
        sheetState,
        opts.sequenceVariant,
      )?.tracksByObject[opts.leaf.sheetObject.address.objectKey]?.trackData[
        opts.leaf.trackId
      ]
      const items: IContextMenuItem[] = []
      if (track?.type === 'GsapClipTrack') {
        const entry = getAnimationEntry(
          opts.leaf.sheetObject,
          track.gsapAnimationId,
        )
        const baseline = resolveGsapClipBaselineTiming(track, entry)
        if (
          baseline &&
          gsapClipTimingDeviatesFromBaseline(track, baseline)
        ) {
          items.push({
            type: 'normal',
            label: 'Reset to original state',
            callback: () => {
              const address = {
                ...opts.leaf.sheetObject.address,
                trackId: opts.leaf.trackId,
                sequenceVariant: opts.sequenceVariant,
              }
              let didReset = false
              getStudio().transaction(({stateEditors}) => {
                didReset =
                  stateEditors.coreByProject.historic.sheetsById.sequence.resetGsapClipTrackToOriginal(
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
                ?.trackData[opts.leaf.trackId]
              if (trackAfter && trackAfter.type === 'GsapClipTrack') {
                applyGsapClipTrackToAnimation(opts.leaf.sheetObject, trackAfter)
              }
              previewGsapClipsAtCurrentPlayhead(opts.leaf.sheetObject)
            },
          })
        }
      }
      items.push({
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
      })
      return items
    },
  })
}

export default GsapClipTrackRow
