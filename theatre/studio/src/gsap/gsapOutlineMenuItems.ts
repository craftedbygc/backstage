import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import type {IContextMenuItem} from '@unseenco/theatre-studio/uiComponents/simpleContextMenu/useContextMenu'
import {isGsapSheetObjectKey} from '@unseenco/theatre-shared/sequence/trackData'
import {isGsapScrollTriggerSheetObjectKey} from '@unseenco/theatre-shared/gsap/gsapSheetObjectKey'
import {addGsapClipAtPlayhead} from './addGsapClipAtPlayhead'
import {
  readGsapClipIsOnSequence,
  removeGsapClipFromSequence,
} from './removeGsapClipFromSequence'

export function getGsapStudioOutlineMenuItems(
  sheetObject: SheetObject,
): IContextMenuItem[] {
  if (!isGsapSheetObjectKey(sheetObject.address.objectKey)) return []

  if (isGsapScrollTriggerSheetObjectKey(sheetObject.address.objectKey)) {
    return []
  }

  if (readGsapClipIsOnSequence(sheetObject)) {
    return [
      {
        type: 'normal',
        label: 'Remove from sequence',
        callback: () => {
          removeGsapClipFromSequence(sheetObject)
        },
      },
    ]
  }

  return [
    {
      type: 'normal',
      label: 'Add to sequence at playhead',
      callback: () => {
        addGsapClipAtPlayhead(sheetObject)
      },
    },
  ]
}
