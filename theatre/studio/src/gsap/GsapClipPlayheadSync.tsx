import {usePrism} from '@unseenco/theatre-react'
import {syncGsapClipsAtSequencePosition} from '@unseenco/theatre-shared/gsap/syncGsapClipsAtSequencePosition'
import {resolveSequenceEditorSheet} from '@unseenco/theatre-studio/selectors'
import {getStudioSequence} from '@unseenco/theatre-studio/utils/activeSequenceVariant'
import type React from 'react'

/**
 * Keeps GSAP clip previews in sync when Studio moves the playhead (scrub,
 * jumps, numeric edits) without relying on the runtime sequence bridge alone.
 */
const GsapClipPlayheadSync: React.VFC = () => {
  usePrism(() => {
    const sheet = resolveSequenceEditorSheet({fallbackToProjectSheet: true})
    if (!sheet) return null

    const sequence = getStudioSequence(sheet)
    const position = sequence.positionPrism.getValue()
    const clips = sequence.publicApi
      .__experimental_getGsapClips()
      .map(({clip}) => ({
        gsapAnimationId: clip.gsapAnimationId,
        start: clip.start,
        duration: clip.duration,
      }))

    if (clips.length > 0) {
      syncGsapClipsAtSequencePosition(position, clips)
    }

    return null
  }, [])

  return null
}

export default GsapClipPlayheadSync
