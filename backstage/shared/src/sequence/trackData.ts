import type {
  BasicKeyframedTrack,
  GsapClipTrack,
  TrackData,
} from '@unseenco/backstage/projects/store/types/SheetState_Historic'

export {
  DEFAULT_GSAP_SHEET_OBJECT_NAMESPACE,
  getConfiguredGsapSheetObjectNamespace,
  isGsapSheetObjectKey,
  setConfiguredGsapSheetObjectNamespace,
} from '@unseenco/backstage-shared/gsap/gsapSheetObjectKey'

export function isBasicKeyframedTrack(
  track: TrackData,
): track is BasicKeyframedTrack {
  return track.type === 'BasicKeyframedTrack'
}

export function isGsapClipTrack(track: TrackData): track is GsapClipTrack {
  return track.type === 'GsapClipTrack'
}

/** Sequence time where the clip bar ends (inclusive). */
export function gsapClipEndTime(
  clip: Pick<GsapClipTrack, 'start' | 'duration'>,
): number {
  return clip.start + clip.duration
}

export function maxGsapClipEndTime(
  clips: ReadonlyArray<Pick<GsapClipTrack, 'start' | 'duration'>>,
): number {
  let max = 0
  for (const clip of clips) {
    max = Math.max(max, gsapClipEndTime(clip))
  }
  return max
}

export function gsapClipLocalProgress(
  sequencePosition: number,
  clip: Pick<GsapClipTrack, 'start' | 'duration'>,
): number {
  if (clip.duration <= 0) return 0
  const raw = (sequencePosition - clip.start) / clip.duration
  if (raw <= 0) return 0
  if (raw >= 1) return 1
  return raw
}

/**
 * Progress for driving a GSAP tween from sequence time.
 *
 * - Before clip start: `0` (hold at tween start)
 * - Inside clip: local linear progress
 * - At or after clip end (including playhead jumps): `1` (completed)
 */
export function gsapClipSyncProgress(
  sequencePosition: number,
  clip: Pick<GsapClipTrack, 'start' | 'duration'>,
): number {
  if (clip.duration <= 0) return 0
  if (sequencePosition < clip.start) return 0
  const clipEnd = gsapClipEndTime(clip)
  if (sequencePosition >= clipEnd - 1e-5) return 1
  const raw = (sequencePosition - clip.start) / clip.duration
  if (raw <= 0) return 0
  if (raw >= 1) return 1
  return raw
}
