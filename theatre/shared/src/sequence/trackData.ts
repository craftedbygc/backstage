import type {
  BasicKeyframedTrack,
  GsapClipTrack,
  TrackData,
} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'

export {
  DEFAULT_GSAP_SHEET_OBJECT_NAMESPACE,
  getConfiguredGsapSheetObjectNamespace,
  isGsapSheetObjectKey,
  setConfiguredGsapSheetObjectNamespace,
} from '@unseenco/theatre-shared/gsap/gsapSheetObjectKey'

export function isBasicKeyframedTrack(
  track: TrackData,
): track is BasicKeyframedTrack {
  return track.type === 'BasicKeyframedTrack'
}

export function isGsapClipTrack(track: TrackData): track is GsapClipTrack {
  return track.type === 'GsapClipTrack'
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
