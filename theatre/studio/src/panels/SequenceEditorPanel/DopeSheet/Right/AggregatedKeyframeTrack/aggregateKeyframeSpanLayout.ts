import type {AggregatedKeyframes} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import {sequencerBarLayoutInScaledSpace} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/Right/keyframeRowUI/sequencerBarLayout'

/** Unit-space span from the earliest to latest child keyframe on an aggregate row. */
export function aggregateKeyframeSpanInUnitSpace(
  aggregatedKeyframes: AggregatedKeyframes,
): {start: number; duration: number} | null {
  const positions = [...aggregatedKeyframes.byPosition.keys()]
  if (positions.length === 0) {
    return null
  }
  const start = Math.min(...positions)
  const end = Math.max(...positions)
  return {start, duration: end - start}
}

export function aggregateKeyframeSpanBarLayoutInScaledSpace(
  aggregatedKeyframes: AggregatedKeyframes,
  scaledSpace: {
    fromUnitSpace: (u: number) => number
    leftPadding: number
  },
): {leftPx: number; widthPx: number} | null {
  const span = aggregateKeyframeSpanInUnitSpace(aggregatedKeyframes)
  if (!span) {
    return null
  }
  return sequencerBarLayoutInScaledSpace(span, scaledSpace)
}
