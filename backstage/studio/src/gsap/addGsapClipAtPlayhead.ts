import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import {val} from '@unseenco/backstage/dataverse'
import {getGsapObjectBinding} from '@unseenco/backstage-shared/gsap/gsapObjectBinding'
import {getAnimationEntryForSheetObject} from '@unseenco/backstage-shared/gsap/gsapAnimationRegistry'
import {introspectGsapTimelineChildren} from '@unseenco/backstage-shared/gsap/introspectGsapTimelineChildren'
import {readGsapTweenTimelineDuration} from '@unseenco/backstage-shared/gsap/syncGsapClipProgress'
import {gsapClipIsOnSequence} from '@unseenco/backstage-shared/gsap/gsapClipOnSequence'
import getStudio from '@unseenco/backstage/studio/getStudio'
import {getStudioActiveSequenceVariant} from '@unseenco/backstage/studio/utils/activeSequenceVariant'

/** Creates a {@link GsapClipTrack} at the current sequence playhead. */
export function addGsapClipAtPlayhead(sheetObject: SheetObject): boolean {
  const binding = getGsapObjectBinding(sheetObject)
  const entry = getAnimationEntryForSheetObject(sheetObject)
  const gsapAnimationId = binding?.gsapAnimationId ?? entry?.id
  if (!gsapAnimationId) return false

  const variant = getStudioActiveSequenceVariant(sheetObject.sheet.address)
  const sheetState = val(
    sheetObject.template.project.pointers.historic.sheetsById[
      sheetObject.address.sheetId
    ],
  )
  if (gsapClipIsOnSequence(sheetObject, variant, sheetState)) {
    return false
  }

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
      sequenceVariant: variant,
      ...(timelineChildren.length > 0 ? {timelineChildren, timelineSpan} : {}),
    })
  })
  return true
}
