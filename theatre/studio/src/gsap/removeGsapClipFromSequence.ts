import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import {val} from '@unseenco/theatre-dataverse'
import {
  gsapClipIsOnSequence,
  listGsapClipTrackIdsOnSequence,
  resolveGsapAnimationIdForSheetObject,
} from '@unseenco/theatre-shared/gsap/gsapClipOnSequence'
import getStudio from '@unseenco/theatre-studio/getStudio'
import {getStudioActiveSequenceVariant} from '@unseenco/theatre-studio/utils/activeSequenceVariant'

/** Deletes all {@link GsapClipTrack}s for this animation on the active sequence variant. */
export function removeGsapClipFromSequence(sheetObject: SheetObject): boolean {
  const gsapAnimationId = resolveGsapAnimationIdForSheetObject(sheetObject)
  if (!gsapAnimationId) return false

  const variant = getStudioActiveSequenceVariant(sheetObject.sheet.address)
  const sheetState = val(
    sheetObject.template.project.pointers.historic.sheetsById[
      sheetObject.address.sheetId
    ],
  )
  const trackIds = listGsapClipTrackIdsOnSequence(
    sheetState,
    sheetObject.address.objectKey,
    variant,
    gsapAnimationId,
  )
  if (trackIds.length === 0) return false

  getStudio().transaction(({stateEditors}) => {
    for (const trackId of trackIds) {
      stateEditors.coreByProject.historic.sheetsById.sequence.deleteGsapClipTrack(
        {
          ...sheetObject.address,
          trackId,
          sequenceVariant: variant,
        },
      )
    }
  })
  return true
}

export function readGsapClipIsOnSequence(sheetObject: SheetObject): boolean {
  const variant = getStudioActiveSequenceVariant(sheetObject.sheet.address)
  const sheetState = val(
    sheetObject.template.project.pointers.historic.sheetsById[
      sheetObject.address.sheetId
    ],
  )
  return gsapClipIsOnSequence(sheetObject, variant, sheetState)
}
