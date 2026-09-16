import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import {val} from '@unseenco/theatre-dataverse'
import {getGsapObjectBinding} from '@unseenco/theatre-shared/gsap/gsapObjectBinding'
import getStudio from '@unseenco/theatre-studio/getStudio'

/** Creates a {@link GsapClipTrack} at the current sequence playhead. */
export function addGsapClipAtPlayhead(sheetObject: SheetObject): boolean {
  const binding = getGsapObjectBinding(sheetObject)
  if (!binding) return false

  getStudio().transaction(({stateEditors}) => {
    const position = val(sheetObject.sheet.publicApi.sequence.pointer.position)
    stateEditors.coreByProject.historic.sheetsById.sequence.addGsapClipTrack({
      ...sheetObject.address,
      gsapAnimationId: binding.gsapAnimationId,
      start: position,
      duration: binding.defaultDuration,
    })
  })
  return true
}
