import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import type {
  HistoricPositionalSequence,
  SheetState_Historic,
  TrackData,
} from '@unseenco/backstage/projects/store/types/SheetState_Historic'
import type {SequenceVariantId} from '@unseenco/backstage/sequences/sequenceVariants'
import type {
  ObjectAddressKey,
  SequenceTrackId,
} from '@unseenco/backstage-shared/utils/ids'
import {isGsapClipTrack} from '@unseenco/backstage-shared/sequence/trackData'
import {getAnimationEntryForSheetObject} from './gsapAnimationRegistry'
import {getGsapObjectBinding} from './gsapObjectBinding'

const DEFAULT_SEQUENCE_VARIANT = 'default'

function sequenceStateForVariant(
  sheetState: SheetState_Historic,
  variantId: SequenceVariantId,
): HistoricPositionalSequence | undefined {
  if (sheetState.sequencesById?.[variantId]) {
    return sheetState.sequencesById[variantId]
  }
  if (variantId === DEFAULT_SEQUENCE_VARIANT && sheetState.sequence) {
    return sheetState.sequence
  }
  return undefined
}

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
  objectKey: ObjectAddressKey,
  sequenceVariant: SequenceVariantId,
  gsapAnimationId?: string,
): SequenceTrackId[] {
  if (!sheetState) return []
  const tracksOfObject = sequenceStateForVariant(sheetState, sequenceVariant)
    ?.tracksByObject[objectKey]
  if (!tracksOfObject) return []

  const linkedTrackIds = new Set(
    Object.values(tracksOfObject.trackIdByPropPath),
  )

  const trackIds: SequenceTrackId[] = []
  for (const trackId of Object.keys(
    tracksOfObject.trackData,
  ) as SequenceTrackId[]) {
    const trackData: TrackData | undefined = tracksOfObject.trackData[trackId]
    if (linkedTrackIds.has(trackId)) continue
    if (!trackData || !isGsapClipTrack(trackData)) continue
    if (
      gsapAnimationId != null &&
      trackData.gsapAnimationId !== gsapAnimationId
    ) {
      continue
    }
    trackIds.push(trackId)
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
