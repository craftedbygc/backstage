import type {IStudio} from '@unseenco/theatre-studio'
import type {Studio} from '@unseenco/theatre-studio/Studio'
import {registerGsapOutlineContextMenuProvider} from '@unseenco/theatre-shared/gsap/outlineContextMenuRegistry'
import {val} from '@unseenco/theatre-dataverse'
import {EXTENSION_ID} from './constants'
import type {TheatreExtension} from './types'
import {getAnimationEntryForSheetObject} from './animationRegistry'
import {introspectGsapTimelineChildren} from '@unseenco/theatre-shared/gsap/introspectGsapTimelineChildren'
import {readGsapTweenTimelineDuration} from '@unseenco/theatre-shared/gsap/syncGsapClipProgress'
import {isGsapSheetObjectKey} from '@unseenco/theatre-shared/sequence/trackData'

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

      const entry = getAnimationEntryForSheetObject(sheetObject)
      if (!entry) return []

      return [
        {
          type: 'normal',
          label: 'Add to sequence at playhead',
          callback: () => {
            ;(config.studio as unknown as Studio).transaction(
              ({stateEditors}) => {
                const position = val(
                  sheetObject.sheet.publicApi.sequence.pointer.position,
                )
                const duration = readGsapTweenTimelineDuration(entry.animation)
                const timelineChildren = introspectGsapTimelineChildren(
                  entry.animation,
                )
                const timelineSpan = duration
                stateEditors.coreByProject.historic.sheetsById.sequence.addGsapClipTrack(
                  {
                    ...sheetObject.address,
                    gsapAnimationId: entry.id,
                    start: position,
                    duration,
                    ...(timelineChildren.length > 0
                      ? {timelineChildren, timelineSpan}
                      : {}),
                  },
                )
              },
            )
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
