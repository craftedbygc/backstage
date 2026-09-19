import type {ISheet, ISheetObject} from '@unseenco/theatre-core'
import type {GsapTweenLike} from './gsapTypes'
import {privateAPI} from '@unseenco/theatre-core/privateAPIs'
import {buildGsapSheetObjectKey} from '@unseenco/theatre-shared/gsap/buildGsapSheetObjectKey'
import {getAnimationEntry} from '@unseenco/theatre-shared/gsap/gsapAnimationRegistry'
import {getTheatreGsapConfig} from './config'
import {registerAnimationInRegistry} from './animationRegistry'
import {formatOutlineNamespacePathKey} from '@unseenco/theatre-shared/utils/outlineNamespaces'

export type RegisterGsapAnimationOptions = {
  /** Theatre object label (shown after the `GSAP/` namespace). */
  label: string
  /** Override namespace from {@link configureTheatreGsap}. */
  namespace?: string
  /**
   * Stable id for this animation on the sheet object. When omitted, defaults to
   * the sanitised sheet object key (e.g. `GSAP / Panel show`).
   * Re-registering with the same id updates the registry entry in place.
   */
  id?: string
  /** Clip length when adding to the sequence (defaults to tween duration). */
  defaultDuration?: number
  /** Rebuild the timeline when native child timing edits fail. */
  onRebuildTimeline?: () => GsapTweenLike
}

export type RegisterGsapAnimationResult = {
  id: string
  sheetObject: ISheetObject<{}>
}

/**
 * Registers a GSAP tween for Theatre sequence bridging and creates an outline
 * proxy object under `GSAP/<label>` (namespace configurable).
 *
 * The animation is paused immediately so Theatre can drive progress.
 */
export function registerGsapAnimation(
  animation: GsapTweenLike,
  sheet: ISheet,
  options: RegisterGsapAnimationOptions,
): RegisterGsapAnimationResult {
  const config = getTheatreGsapConfig()
  const namespace = options.namespace ?? config.namespace ?? 'GSAP'
  const objectKey = buildGsapSheetObjectKey(namespace, options.label)
  const id = options.id ?? objectKey

  animation.pause()

  const sheetObjectPublic = sheet.object(objectKey, {}, {reconfigure: false})
  const sheetObjectInternal = privateAPI(sheetObjectPublic)

  const existing = getAnimationEntry(sheetObjectInternal, id)

  if (config.outlineNamespace && !existing) {
    privateAPI(sheet).template.setOutlineNamespaceConfig(
      formatOutlineNamespacePathKey([namespace]),
      config.outlineNamespace,
    )
  }

  registerAnimationInRegistry({
    id,
    label: options.label,
    animation,
    sheetObject: sheetObjectInternal,
    defaultDuration:
      options.defaultDuration ??
      (sheet.getSequenceMode() === 'page' ? 10 : undefined),
    onRebuildTimeline: options.onRebuildTimeline,
  })

  return {id, sheetObject: sheetObjectPublic}
}
