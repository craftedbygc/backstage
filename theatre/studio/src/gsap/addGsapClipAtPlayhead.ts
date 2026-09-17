import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import {val} from '@unseenco/theatre-dataverse'
import {getGsapObjectBinding} from '@unseenco/theatre-shared/gsap/gsapObjectBinding'
import {getAnimationEntryForSheetObject} from '@unseenco/theatre-shared/gsap/gsapAnimationRegistry'
import {introspectGsapTimelineChildren} from '@unseenco/theatre-shared/gsap/introspectGsapTimelineChildren'
import {readGsapTweenTimelineDuration} from '@unseenco/theatre-shared/gsap/syncGsapClipProgress'
import getStudio from '@unseenco/theatre-studio/getStudio'

/** Creates a {@link GsapClipTrack} at the current sequence playhead. */
export function addGsapClipAtPlayhead(sheetObject: SheetObject): boolean {
  const binding = getGsapObjectBinding(sheetObject)
  const entry = getAnimationEntryForSheetObject(sheetObject)
  const gsapAnimationId = binding?.gsapAnimationId ?? entry?.id
  if (!gsapAnimationId) return false

  const duration =
    binding?.defaultDuration ??
    entry?.defaultDuration ??
    (entry?.animation ? readGsapTweenTimelineDuration(entry.animation) : 1)

  const timelineChildren =
    entry?.animation != null
      ? introspectGsapTimelineChildren(entry.animation)
      : []
  const timelineSpan =
    entry?.animation != null
      ? readGsapTweenTimelineDuration(entry.animation)
      : duration

  getStudio().transaction(({stateEditors}) => {
    const position = val(sheetObject.sheet.publicApi.sequence.pointer.position)
    stateEditors.coreByProject.historic.sheetsById.sequence.addGsapClipTrack({
      ...sheetObject.address,
      gsapAnimationId,
      start: position,
      duration,
      ...(timelineChildren.length > 0 ? {timelineChildren, timelineSpan} : {}),
    })
  })
  return true
}
