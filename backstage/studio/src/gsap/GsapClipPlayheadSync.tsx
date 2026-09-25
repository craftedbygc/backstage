import {usePrism} from '@unseenco/backstage/react'
import {buildGsapClipTimingsFromSequence} from '@unseenco/backstage-shared/gsap/buildGsapClipTimingsFromSequence'
import {subscribeGsapClipSyncAtPlayhead} from '@unseenco/backstage-shared/gsap/subscribeGsapClipSyncAtPlayhead'
import {resolveSequenceEditorSheet} from '@unseenco/backstage/studio/selectors'
import {getStudioSequence} from '@unseenco/backstage/studio/utils/activeSequenceVariant'
import type React from 'react'
import {useLayoutEffect} from 'react'

/**
 * Keeps GSAP clip previews in sync when Studio moves the playhead for sheets
 * that do not have the runtime {@link Sheet.enableGsapSequenceBridge} attached.
 */
const GsapClipPlayheadSync: React.VFC = () => {
  const sheet = usePrism(
    () => resolveSequenceEditorSheet({fallbackToProjectSheet: true}),
    [],
  )

  useLayoutEffect(() => {
    if (!sheet) return
    if (sheet._gsapBridgeDisposer) {
      return
    }

    const sequence = getStudioSequence(sheet)
    const sheetAddress = sheet.address

    return subscribeGsapClipSyncAtPlayhead({
      pointer: sequence.publicApi.pointer,
      getGsapClipTimings: () =>
        buildGsapClipTimingsFromSequence(
          sheetAddress,
          sequence.publicApi.__experimental_getGsapClips(),
        ),
    })
  }, [sheet])

  return null
}

export default GsapClipPlayheadSync
