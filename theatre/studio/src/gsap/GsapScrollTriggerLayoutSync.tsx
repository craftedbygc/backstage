import {usePrism} from '@unseenco/backstage/react'
import {val} from '@unseenco/theatre-dataverse'
import {refreshScrollTriggerLayoutsForSheet} from '@unseenco/backstage-shared/gsap/refreshScrollTriggerLayoutsForSheet'
import {getActivePageScrollContext} from '@unseenco/backstage-shared/sheets/pageScrollContext'
import {onRemotePageScrollMetricsChange} from '@unseenco/backstage-shared/sheets/remotePageScrollMetrics'
import {sheetAddressKey} from '@unseenco/backstage-shared/gsap/scrollTriggerRegistry'
import {resolveSequenceEditorSheet} from '@unseenco/theatre-studio/selectors'
import {getStudioSequence} from '@unseenco/theatre-studio/utils/activeSequenceVariant'
import type React from 'react'
import {useLayoutEffect} from 'react'

/**
 * Keeps registered ScrollTrigger sequencer layouts in sync after ST refresh / resize.
 */
const GsapScrollTriggerLayoutSync: React.VFC = () => {
  const sheet = usePrism(
    () => resolveSequenceEditorSheet({fallbackToProjectSheet: true}),
    [],
  )

  useLayoutEffect(() => {
    if (!sheet || sheet.getSequenceMode() !== 'page') {
      return
    }

    const sequence = getStudioSequence(sheet)
    const sheetKey = sheetAddressKey(sheet.address)
    const refresh = () => {
      refreshScrollTriggerLayoutsForSheet(
        sheetKey,
        val(sequence.publicApi.pointer.length),
        getActivePageScrollContext(),
      )
    }

    refresh()

    const onResize = () => refresh()
    window.addEventListener('resize', onResize)
    const removeMetricsListener = onRemotePageScrollMetricsChange(refresh)

    const ScrollTrigger = (
      globalThis as typeof globalThis & {
        ScrollTrigger?: {
          addEventListener?: (type: string, cb: () => void) => void
          removeEventListener?: (type: string, cb: () => void) => void
        }
      }
    ).ScrollTrigger

    ScrollTrigger?.addEventListener?.('refresh', refresh)

    return () => {
      window.removeEventListener('resize', onResize)
      removeMetricsListener()
      ScrollTrigger?.removeEventListener?.('refresh', refresh)
    }
  }, [sheet])

  return null
}

export default GsapScrollTriggerLayoutSync
