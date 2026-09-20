import type {AggregatedKeyframes} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import type {KeyframeWithTrack} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import type {Keyframe} from '@unseenco/backstage/projects/store/types/SheetState_Historic'
import type Sheet from '@unseenco/backstage/sheets/Sheet'
import type {SheetObjectAddress} from '@unseenco/backstage-shared/utils/addresses'
import type {SequenceTrackId} from '@unseenco/backstage-shared/utils/ids'
import type {CommitOrDiscard} from '@unseenco/backstage/studio/StudioStore/StudioStore'
import getStudio from '@unseenco/backstage/studio/getStudio'
import {clampSequenceEditorPosition} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/sequenceEditLimits'
import {transformNumber} from '@unseenco/backstage-shared/utils/transformNumber'
import {aggregateKeyframeSpanInUnitSpace} from './aggregateKeyframeSpanLayout'

type TrackKeyframeBatch = {
  address: SheetObjectAddress
  trackId: SequenceTrackId
  keyframes: Keyframe[]
}

function trackBatchKey(address: SheetObjectAddress, trackId: SequenceTrackId) {
  return `${address.objectKey}:${trackId}`
}

function appendToTrackBatch(
  batches: Map<string, TrackKeyframeBatch>,
  keyframeWithTrack: KeyframeWithTrack,
  positionDelta: number,
  sheet: Sheet,
) {
  appendToTrackBatchAtPosition(
    batches,
    keyframeWithTrack,
    keyframeWithTrack.kf.position + positionDelta,
    sheet,
  )
}

function appendToTrackBatchAtPosition(
  batches: Map<string, TrackKeyframeBatch>,
  {track, kf}: KeyframeWithTrack,
  position: number,
  sheet: Sheet,
) {
  const key = trackBatchKey(track.sheetObject.address, track.id)
  let batch = batches.get(key)
  if (!batch) {
    batch = {
      address: track.sheetObject.address,
      trackId: track.id,
      keyframes: [],
    }
    batches.set(key, batch)
  }
  batch.keyframes.push({
    ...kf,
    position: clampSequenceEditorPosition(position, sheet),
  })
}

export function allKeyframeWithTracksInAggregate(
  aggregatedKeyframes: AggregatedKeyframes,
): KeyframeWithTrack[] {
  const result: KeyframeWithTrack[] = []
  for (const keyframes of aggregatedKeyframes.byPosition.values()) {
    result.push(...keyframes)
  }
  return result
}

export function limitAggregateSpanMoveDelta(
  keyframes: KeyframeWithTrack[],
  proposedDelta: number,
): number {
  let minPosition = Infinity
  for (const {kf} of keyframes) {
    minPosition = Math.min(minPosition, kf.position)
  }
  if (!Number.isFinite(minPosition)) {
    return 0
  }
  return Math.max(proposedDelta, -minPosition)
}

export function keyframesAtAggregateSpanPosition(
  aggregatedKeyframes: AggregatedKeyframes,
  position: number,
): KeyframeWithTrack[] {
  return aggregatedKeyframes.byPosition.get(position) ?? []
}

export function applyAggregateKeyframePositionDelta(
  keyframes: KeyframeWithTrack[],
  positionDelta: number,
  sheet: Sheet,
  sequenceVariant: string,
  snappingFunction: (n: number) => number,
): CommitOrDiscard {
  return getStudio()!.tempTransaction(({stateEditors}) => {
    const batches = new Map<string, TrackKeyframeBatch>()
    for (const keyframeWithTrack of keyframes) {
      appendToTrackBatch(batches, keyframeWithTrack, positionDelta, sheet)
    }
    for (const {
      address,
      trackId,
      keyframes: updatedKeyframes,
    } of batches.values()) {
      stateEditors.coreByProject.historic.sheetsById.sequence.replaceKeyframes({
        ...address,
        trackId,
        keyframes: updatedKeyframes,
        snappingFunction,
        sequenceVariant,
      })
    }
  })
}

/** Scale keyframe times in a span around `origin` (from drag-start positions). */
export function applyAggregateSpanScaleFromDragStart(
  keyframesAtDragStart: KeyframeWithTrack[],
  origin: number,
  scale: number,
  sheet: Sheet,
  sequenceVariant: string,
  snappingFunction: (n: number) => number,
): CommitOrDiscard {
  return getStudio()!.tempTransaction(({stateEditors}) => {
    const batches = new Map<string, TrackKeyframeBatch>()
    for (const keyframeWithTrack of keyframesAtDragStart) {
      const {kf} = keyframeWithTrack
      const scaledPosition = snappingFunction(
        transformNumber(kf.position, {origin, scale, translate: 0}),
      )
      appendToTrackBatchAtPosition(
        batches,
        keyframeWithTrack,
        scaledPosition,
        sheet,
      )
    }
    for (const {
      address,
      trackId,
      keyframes: updatedKeyframes,
    } of batches.values()) {
      stateEditors.coreByProject.historic.sheetsById.sequence.replaceKeyframes({
        ...address,
        trackId,
        keyframes: updatedKeyframes,
        snappingFunction,
        sequenceVariant,
      })
    }
  })
}

export function aggregateSpanScaleFromFixedEnd(
  spanStartAtDrag: number,
  spanEndAtDrag: number,
  newStart: number,
): number {
  const oldDuration = spanEndAtDrag - spanStartAtDrag
  if (oldDuration === 0) {
    return 1
  }
  return (newStart - spanEndAtDrag) / (spanStartAtDrag - spanEndAtDrag)
}

export function aggregateSpanScaleFromFixedStart(
  spanStartAtDrag: number,
  spanEndAtDrag: number,
  newEnd: number,
): number {
  const oldDuration = spanEndAtDrag - spanStartAtDrag
  if (oldDuration === 0) {
    return 1
  }
  return (newEnd - spanStartAtDrag) / oldDuration
}

export function clampAggregateSpanResizeStart(
  proposedStart: number,
  spanEnd: number,
  sheet: Sheet,
): number {
  const start = clampSequenceEditorPosition(proposedStart, sheet)
  return Math.min(start, spanEnd)
}

export function clampAggregateSpanResizeEnd(
  spanStart: number,
  proposedEnd: number,
  sheet: Sheet,
): number {
  const end = clampSequenceEditorPosition(proposedEnd, sheet)
  return Math.max(end, spanStart)
}

export function aggregateSpanEnd(span: {
  start: number
  duration: number
}): number {
  return span.start + span.duration
}

export function requireAggregateSpan(
  aggregatedKeyframes: AggregatedKeyframes,
): {start: number; duration: number} | null {
  return aggregateKeyframeSpanInUnitSpace(aggregatedKeyframes)
}
