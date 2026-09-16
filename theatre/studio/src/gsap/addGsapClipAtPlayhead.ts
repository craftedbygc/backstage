import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import {val} from '@unseenco/theatre-dataverse'
import {getGsapObjectBinding} from '@unseenco/theatre-shared/gsap/gsapObjectBinding'
import {getAnimationEntryForSheetObject} from '@unseenco/theatre-shared/gsap/gsapAnimationRegistry'
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
    (typeof (entry?.animation as {duration?: () => number} | undefined)
      ?.duration === 'function'
      ? (() => {
          const d = (entry!.animation as {duration: () => number}).duration()
          return d > 0 ? d : 1
        })()
      : 1)

  getStudio().transaction(({stateEditors}) => {
    const position = val(sheetObject.sheet.publicApi.sequence.pointer.position)
    stateEditors.coreByProject.historic.sheetsById.sequence.addGsapClipTrack({
      ...sheetObject.address,
      gsapAnimationId,
      start: position,
      duration,
    })
  })
  return true
}
