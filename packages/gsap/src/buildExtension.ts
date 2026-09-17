import type {IStudio} from '@unseenco/theatre-studio'
import {registerGsapOutlineContextMenuProvider} from '@unseenco/theatre-shared/gsap/outlineContextMenuRegistry'
import {val} from '@unseenco/theatre-dataverse'
import {EXTENSION_ID} from './constants'
import type {TheatreExtension} from './types'
import {isGsapSheetObjectKey} from '@unseenco/theatre-shared/sequence/trackData'
import {addGsapClipAtPlayhead} from '@unseenco/theatre-studio/gsap/addGsapClipAtPlayhead'
import {readGsapClipIsOnSequence, removeGsapClipFromSequence} from '@unseenco/theatre-studio/gsap/removeGsapClipFromSequence'

export type GsapStudioExtensionConfig = {
  studio: IStudio
}

export type GsapStudioExtension = {
  extension: TheatreExtension
  dispose: () => void
}

export function buildExtension(
  config: GsapStudioExtensionConfig,
): GsapStudioExtension {
  const unregisterOutline = registerGsapOutlineContextMenuProvider(
    (sheetObject) => {
      if (!isGsapSheetObjectKey(sheetObject.address.objectKey)) return []

      val(
        sheetObject.template.project.pointers.historic.sheetsById[
          sheetObject.address.sheetId
        ],
      )

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
    },
  )

  const extension: TheatreExtension = {
    id: EXTENSION_ID,
  }

  return {
    extension,
    dispose: unregisterOutline,
  }
}
