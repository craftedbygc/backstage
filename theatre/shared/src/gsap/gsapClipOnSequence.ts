import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import type {SheetState_Historic} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import type {SequenceVariantId} from '@unseenco/theatre-core/sequences/sequenceVariants'
import {getSequenceStateFromSheet} from '@unseenco/theatre-core/sequences/sequenceVariants'
import type {SequenceTrackId} from '@unseenco/theatre-shared/utils/ids'
import {isGsapClipTrack} from '@unseenco/theatre-shared/sequence/trackData'
import {getAnimationEntryForSheetObject} from './gsapAnimationRegistry'
import {getGsapObjectBinding} from './gsapObjectBinding'

export function resolveGsapAnimationIdForSheetObject(
  sheetObject: SheetObject,
): string | undefined {
  const binding = getGsapObjectBinding(sheetObject)
  const entry = getAnimationEntryForSheetObject(sheetObject)
  return binding?.gsapAnimationId ?? entry?.id
}

/**
 * GSAP clip tracks stored on an object that are not linked via prop paths.
 * When `gsapAnimationId` is set, only matching clips are returned (legacy duplicates included).
 */
export function listGsapClipTrackIdsOnSequence(
  sheetState: SheetState_Historic | undefined,
  objectKey: string,
  sequenceVariant: SequenceVariantId,
  gsapAnimationId?: string,
): SequenceTrackId[] {
  if (!sheetState) return []
  const tracksOfObject = getSequenceStateFromSheet(
    sheetState,
    sequenceVariant,
  )?.tracksByObject[objectKey]
  if (!tracksOfObject) return []

  const linkedTrackIds = new Set(
    Object.values(tracksOfObject.trackIdByPropPath),
  )

  const trackIds: SequenceTrackId[] = []
  for (const [trackId, trackData] of Object.entries(tracksOfObject.trackData)) {
    if (linkedTrackIds.has(trackId as SequenceTrackId)) continue
    if (!trackData || !isGsapClipTrack(trackData)) continue
    if (gsapAnimationId != null && trackData.gsapAnimationId !== gsapAnimationId) {
      continue
    }
    trackIds.push(trackId as SequenceTrackId)
  }
  return trackIds
}

export function gsapClipIsOnSequence(
  sheetObject: SheetObject,
  sequenceVariant: SequenceVariantId,
  sheetState: SheetState_Historic | undefined,
): boolean {
  const gsapAnimationId = resolveGsapAnimationIdForSheetObject(sheetObject)
  if (!gsapAnimationId) return false
  return (
    listGsapClipTrackIdsOnSequence(
      sheetState,
      sheetObject.address.objectKey,
      sequenceVariant,
      gsapAnimationId,
    ).length > 0
  )
}
