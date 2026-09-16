import type {ISheet, ISheetObject} from '@unseenco/theatre-core'
import type {GsapTweenLike} from './gsapTypes'
import {privateAPI} from '@unseenco/theatre-core/privateAPIs'
import {generateSequenceTrackId} from '@unseenco/theatre-shared/utils/ids'
import {getTheatreGsapConfig} from './config'
import {
  getAnimationEntryById,
  registerAnimationInRegistry,
} from './animationRegistry'
import {formatOutlineNamespacePathKey} from '@unseenco/theatre-shared/utils/outlineNamespaces'

export type RegisterGsapAnimationOptions = {
  /** Theatre object label (shown after the `GSAP/` namespace). */
  label: string
  /** Override namespace from {@link configureTheatreGsap}. */
  namespace?: string
  /**
   * Stable id for this animation. When omitted, a random id is generated.
   * Re-registering with the same id updates the registry entry.
   */
  id?: string
  /** Clip length when adding to the sequence (defaults to tween duration). */
  defaultDuration?: number
}

export type RegisterGsapAnimationResult = {
  id: string
  sheetObject: ISheetObject<{}>
}

function buildObjectKey(namespace: string, label: string): string {
  const trimmedNs = namespace.replace(/\/+$/g, '')
  const trimmedLabel = label.replace(/^\/+/g, '')
  return `${trimmedNs}/${trimmedLabel}`
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
  const id = options.id ?? `gsap_${generateSequenceTrackId()}`
  const objectKey = buildObjectKey(namespace, options.label)

  animation.pause()

  const existing = getAnimationEntryById(id)
  const sheetObjectPublic = sheet.object(objectKey, {}, {reconfigure: false})
  const sheetObjectInternal = privateAPI(sheetObjectPublic)

  if (existing?.sheetObject) {
    registerAnimationInRegistry({
      id,
      label: options.label,
      animation,
      sheetObject: existing.sheetObject,
      defaultDuration: options.defaultDuration,
    })
    return {id, sheetObject: sheetObjectPublic}
  }

  if (config.outlineNamespace) {
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
    defaultDuration: options.defaultDuration,
  })

  return {id, sheetObject: sheetObjectPublic}
}
