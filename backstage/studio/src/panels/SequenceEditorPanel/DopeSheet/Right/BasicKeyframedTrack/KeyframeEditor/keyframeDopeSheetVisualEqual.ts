import type {
  BasicKeyframedTrack,
  Keyframe,
} from '@unseenco/backstage/projects/store/types/SheetState_Historic'
import type {ISingleKeyframeEditorProps} from './singleKeyframeEditorTypes'

/** Fields that affect dope-sheet dot/connector chrome; excludes animated {@link Keyframe.value}. */
export function keyframesEqualForDopeSheetChrome(
  a: Keyframe,
  b: Keyframe,
): boolean {
  return (
    a.id === b.id &&
    a.position === b.position &&
    a.type === b.type &&
    a.connectedRight === b.connectedRight &&
    a.tweenLabel === b.tweenLabel
  )
}

export function basicKeyframedTracksEqualForDopeSheetChrome(
  a: BasicKeyframedTrack,
  b: BasicKeyframedTrack,
): boolean {
  if (a.keyframes.length !== b.keyframes.length) {
    return false
  }
  for (let i = 0; i < a.keyframes.length; i++) {
    if (!keyframesEqualForDopeSheetChrome(a.keyframes[i], b.keyframes[i])) {
      return false
    }
  }
  return true
}

export function singleKeyframeEditorPropsAreEqual(
  prev: ISingleKeyframeEditorProps,
  next: ISingleKeyframeEditorProps,
): boolean {
  if (
    prev.index !== next.index ||
    prev.layoutP !== next.layoutP ||
    prev.leaf !== next.leaf ||
    prev.itemKey !== next.itemKey ||
    prev.selection !== next.selection
  ) {
    return false
  }

  if (!keyframesEqualForDopeSheetChrome(prev.keyframe, next.keyframe)) {
    return false
  }

  if (prev.track.id !== next.track.id) {
    return false
  }

  const prevKeyframes = prev.track.data.keyframes
  const nextKeyframes = next.track.data.keyframes
  const prevNext = prevKeyframes[prev.index + 1]
  const nextNext = nextKeyframes[next.index + 1]

  if (prevNext !== nextNext) {
    if (!prevNext || !nextNext) {
      return prevNext === nextNext
    }
    if (!keyframesEqualForDopeSheetChrome(prevNext, nextNext)) {
      return false
    }
  }

  return true
}
