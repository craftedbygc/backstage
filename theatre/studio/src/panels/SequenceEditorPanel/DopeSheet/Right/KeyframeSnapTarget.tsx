import type {SequenceEditorPanelLayout} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/layout'
import type {Pointer} from '@unseenco/theatre-dataverse'
import {Atom} from '@unseenco/theatre-dataverse'
import {val} from '@unseenco/theatre-dataverse'
import React from 'react'
import styled from 'styled-components'
import {DopeSnapHitZoneUI} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/RightOverlay/DopeSnapHitZoneUI'
import type {
  ObjectAddressKey,
  SequenceTrackId,
} from '@unseenco/backstage-shared/utils/ids'
import type {
  BasicKeyframedTrack,
  GsapClipTrack,
  HistoricPositionalSequence,
  Keyframe,
} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import {isGsapClipTrack} from '@unseenco/backstage-shared/sequence/trackData'
import {gsapTimelineChildClipInSequenceSpace} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/Right/GsapClipTrack/gsapTimelineChildBarLayout'
import {uniq} from 'lodash-es'

const HitZone = styled.div`
  z-index: 1;
  cursor: ew-resize;

  ${DopeSnapHitZoneUI.CSS}

  #pointer-root.draggingPositionInSequenceEditor & {
    ${DopeSnapHitZoneUI.CSS_WHEN_SOMETHING_DRAGGING}
  }
`

const Container = styled.div`
  position: absolute;
`

export type ISnapTargetPRops = {
  layoutP: Pointer<SequenceEditorPanelLayout>
  leaf: {nodeHeight: number}
  position: number
}

const KeyframeSnapTarget: React.VFC<ISnapTargetPRops> = (props) => {
  return (
    <Container
      style={{
        top: `${props.leaf.nodeHeight / 2}px`,
        left: `calc(${val(
          props.layoutP.scaledSpace.leftPadding,
        )}px + calc(var(--unitSpaceToScaledSpaceMultiplier) * ${
          props.position
        }px))`,
      }}
    >
      <HitZone
        {...DopeSnapHitZoneUI.reactProps({
          isDragging: false,
          position: props.position,
        })}
      />
    </Container>
  )
}

export default KeyframeSnapTarget

export type KeyframeSnapPositions = {
  [objectKey: ObjectAddressKey]: {
    [trackId: SequenceTrackId]: number[]
  }
}

const stateB = new Atom<
  | {
      // all keyframes must be snap targets
      mode: 'snapToAll'
    }
  | {
      // only these keyframes must be snap targets
      mode: 'snapToSome'
      positions: KeyframeSnapPositions
    }
  | {
      // no keyframe should be a snap target
      mode: 'snapToNone'
    }
>({mode: 'snapToNone'})

export const snapPositionsStateD = stateB.prism

export function snapToAll() {
  stateB.set({mode: 'snapToAll'})
}

export function snapToNone() {
  stateB.set({mode: 'snapToNone'})
}

export function snapToSome(positions: KeyframeSnapPositions) {
  stateB.set({mode: 'snapToSome', positions})
}

export function collectKeyframeSnapPositions(
  tracksByObject: HistoricPositionalSequence['tracksByObject'],
  shouldIncludeKeyframe: (
    kf: Keyframe,
    track: {
      trackId: SequenceTrackId
      trackData: BasicKeyframedTrack
      objectKey: ObjectAddressKey
    },
  ) => boolean,
): KeyframeSnapPositions {
  return Object.fromEntries(
    Object.entries(tracksByObject ?? {}).map(
      ([objectKey, trackDataAndTrackIdByPropPath]) => [
        objectKey,
        Object.fromEntries(
          Object.entries(trackDataAndTrackIdByPropPath!.trackData).flatMap(
            ([trackId, track]) => {
              if (track?.type !== 'BasicKeyframedTrack') return []
              return [
                [
                  trackId,
                  track.keyframes
                    .filter((kf) =>
                      shouldIncludeKeyframe(kf, {
                        trackId,
                        trackData: track,
                        objectKey,
                      }),
                    )
                    .map((keyframe) => keyframe.position),
                ],
              ]
            },
          ),
        ),
      ],
    ),
  )
}

export function gsapClipEdgeTimes(
  clip: Pick<GsapClipTrack, 'start' | 'duration'>,
): [number, number] {
  return [clip.start, clip.start + clip.duration]
}

export function collectGsapClipEdgeSnapPositions(
  tracksByObject: HistoricPositionalSequence['tracksByObject'],
  shouldIncludeClip?: (
    clip: GsapClipTrack,
    track: {
      trackId: SequenceTrackId
      objectKey: ObjectAddressKey
    },
  ) => boolean,
): KeyframeSnapPositions {
  return Object.fromEntries(
    Object.entries(tracksByObject ?? {}).map(
      ([objectKey, trackDataAndTrackIdByPropPath]) => [
        objectKey,
        Object.fromEntries(
          Object.entries(trackDataAndTrackIdByPropPath!.trackData).flatMap(
            ([trackId, track]) => {
              if (!track || !isGsapClipTrack(track)) return []
              if (
                shouldIncludeClip &&
                !shouldIncludeClip(track, {trackId, objectKey})
              ) {
                return []
              }
              const positions: number[] = [...gsapClipEdgeTimes(track)]
              if (track.timelineChildren?.length) {
                const span = track.timelineSpan ?? track.duration
                for (const child of track.timelineChildren) {
                  const seq = gsapTimelineChildClipInSequenceSpace(
                    track,
                    child,
                    span,
                  )
                  positions.push(seq.start, seq.start + seq.duration)
                }
              }
              return [[trackId, uniq(positions)]]
            },
          ),
        ),
      ],
    ),
  )
}

export function mergeKeyframeSnapPositions(
  ...positionMaps: KeyframeSnapPositions[]
): KeyframeSnapPositions {
  const merged: KeyframeSnapPositions = {}

  for (const positionMap of positionMaps) {
    for (const [objectKey, tracks] of Object.entries(positionMap)) {
      if (!merged[objectKey]) {
        merged[objectKey] = {}
      }
      for (const [trackId, positions] of Object.entries(tracks)) {
        const existing = merged[objectKey]![trackId] ?? []
        merged[objectKey]![trackId] = uniq([...existing, ...positions])
      }
    }
  }

  return merged
}

export function collectSequenceEditorSnapPositions(
  tracksByObject: HistoricPositionalSequence['tracksByObject'],
  options: {
    shouldIncludeKeyframe: (
      kf: Keyframe,
      track: {
        trackId: SequenceTrackId
        trackData: BasicKeyframedTrack
        objectKey: ObjectAddressKey
      },
    ) => boolean
    shouldIncludeGsapClip?: (
      clip: GsapClipTrack,
      track: {
        trackId: SequenceTrackId
        objectKey: ObjectAddressKey
      },
    ) => boolean
  },
): KeyframeSnapPositions {
  return mergeKeyframeSnapPositions(
    collectKeyframeSnapPositions(tracksByObject, options.shouldIncludeKeyframe),
    collectGsapClipEdgeSnapPositions(
      tracksByObject,
      options.shouldIncludeGsapClip,
    ),
  )
}
