import {resolveSequenceEditorSheet} from '@unseenco/theatre-studio/selectors'
import {isSheetInPageMode} from '@unseenco/theatre-studio/sheets/sheetSequenceMode'
import getStudio from '@unseenco/theatre-studio/getStudio'
import {usePrism} from '@unseenco/theatre-react'
import type React from 'react'
import {useLayoutEffect} from 'react'

/**
 * In page mode, keeps the sequence playhead aligned with native document scroll.
 */
const SheetPageScrollSync: React.VFC = () => {
  const sheet = usePrism(
    () => resolveSequenceEditorSheet({fallbackToProjectSheet: true}),
    [],
  )

  useLayoutEffect(() => {
    if (!sheet || !isSheetInPageMode(sheet)) return
    const core = getStudio()?.core
    if (!core) return
    return core.attachSheetScrollDriver(sheet.publicApi)
  }, [sheet])

  return null
}

export default SheetPageScrollSync
