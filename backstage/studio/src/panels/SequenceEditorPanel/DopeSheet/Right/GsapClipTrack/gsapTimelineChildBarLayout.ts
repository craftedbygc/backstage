import type {GsapTimelineChildClip} from '@unseenco/backstage/projects/store/types/SheetState_Historic'

/** Maps a child tween's local timeline timing into sequence unit space inside the parent clip. */
export function gsapTimelineChildClipInSequenceSpace(
  parent: {start: number; duration: number},
  child: Pick<GsapTimelineChildClip, 'localStart' | 'localDuration'>,
  timelineSpanSeconds: number,
): {start: number; duration: number} {
  const span = Math.max(timelineSpanSeconds, 0.01)
  const start = parent.start + (child.localStart / span) * parent.duration
  const duration = (child.localDuration / span) * parent.duration
  return {
    start,
    duration: Math.max(duration, 0.01),
  }
}
