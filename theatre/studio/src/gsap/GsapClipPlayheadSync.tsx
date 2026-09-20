import {usePrism} from '@unseenco/backstage/react'
import {sheetObjectAddressKeyFromParts} from '@unseenco/backstage-shared/gsap/gsapAnimationRegistry'
import type {ObjectAddressKey} from '@unseenco/backstage-shared/utils/ids'
import {subscribeGsapClipSyncAtPlayhead} from '@unseenco/backstage-shared/gsap/subscribeGsapClipSyncAtPlayhead'
import {resolveSequenceEditorSheet} from '@unseenco/theatre-studio/selectors'
import {getStudioSequence} from '@unseenco/theatre-studio/utils/activeSequenceVariant'
import type React from 'react'
import {useLayoutEffect} from 'react'

/**
 * Keeps GSAP clip previews in sync when Studio moves the playhead (scrub,
 * jumps, numeric edits) without relying on the runtime sequence bridge alone.
 */
const GsapClipPlayheadSync: React.VFC = () => {
  const sheet = usePrism(
    () => resolveSequenceEditorSheet({fallbackToProjectSheet: true}),
    [],
  )

  useLayoutEffect(() => {
    if (!sheet) return

    const sequence = getStudioSequence(sheet)
    const sheetAddress = sheet.address

    return subscribeGsapClipSyncAtPlayhead({
      pointer: sequence.publicApi.pointer,
      getGsapClipTimings: () =>
        sequence.publicApi
          .__experimental_getGsapClips()
          .map(({objectKey, clip}) => ({
            sheetObjectAddressKey: sheetObjectAddressKeyFromParts({
              projectId: sheetAddress.projectId,
              sheetId: sheetAddress.sheetId,
              sheetInstanceId: sheetAddress.sheetInstanceId,
              objectKey: objectKey as ObjectAddressKey,
            }),
            gsapAnimationId: clip.gsapAnimationId,
            start: clip.start,
            duration: clip.duration,
          })),
    })
  }, [sheet])

  return null
}

export default GsapClipPlayheadSync
