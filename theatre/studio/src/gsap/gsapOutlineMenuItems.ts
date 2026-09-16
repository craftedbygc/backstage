import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import type {IContextMenuItem} from '@unseenco/theatre-studio/uiComponents/simpleContextMenu/useContextMenu'
import {isGsapSheetObjectKey} from '@unseenco/theatre-shared/sequence/trackData'
import {addGsapClipAtPlayhead} from './addGsapClipAtPlayhead'

export function getGsapStudioOutlineMenuItems(
  sheetObject: SheetObject,
): IContextMenuItem[] {
  if (!isGsapSheetObjectKey(sheetObject.address.objectKey)) return []

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
