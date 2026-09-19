import type {ISheet} from '@unseenco/theatre-core'
import {privateAPI} from '@unseenco/theatre-core/privateAPIs'
import {buildGsapSheetObjectKey} from '@unseenco/theatre-shared/gsap/buildGsapSheetObjectKey'
import {extractScrollTriggerLayout} from '@unseenco/theatre-shared/gsap/extractScrollTriggerLayout'
import {
  registerScrollTriggerInRegistry,
  sheetAddressKey,
} from '@unseenco/theatre-shared/gsap/scrollTriggerRegistry'
import type {GsapScrollTriggerRegistryEntry} from '@unseenco/theatre-shared/gsap/scrollTriggerRegistry'
import {formatOutlineNamespacePathKey} from '@unseenco/theatre-shared/utils/outlineNamespaces'
import {getTheatreGsapConfig} from './config'
import type {GsapScrollTriggerLike} from './gsapScrollTriggerTypes'
import {
  refreshGsapScrollTriggers,
  requireGsapScrollTriggerPlugin,
} from './gsapScrollTriggerPlugin'
import {refreshScrollTriggerLayoutsForSheet} from '@unseenco/theatre-shared/gsap/refreshScrollTriggerLayoutsForSheet'

export type RegisterGsapScrollTriggerOptions = {
  label: string
  namespace?: string
  id?: string
}

export type RegisterGsapScrollTriggerResult = {
  id: string
  sheetObject: ReturnType<ISheet['object']>
}

function assertPageMode(sheet: ISheet): void {
  if (sheet.getSequenceMode() !== 'page') {
    throw new Error(
      'registerGsapScrollTrigger() requires the sheet to use sequenceMode "page".',
    )
  }
}

function sequenceLengthForSheet(sheet: ISheet): number {
  return privateAPI(sheet).getSequence().length
}

function scrollTriggerObjectKey(namespace: string, label: string): string {
  return buildGsapSheetObjectKey(namespace, `ScrollTrigger / ${label}`)
}

export function registerOneGsapScrollTriggerOnSheet(
  sheet: ISheet,
  st: GsapScrollTriggerLike,
  options: RegisterGsapScrollTriggerOptions,
  fallbackIndex: number,
): RegisterGsapScrollTriggerResult | null {
  const config = getTheatreGsapConfig()
  const namespace = options.namespace ?? config.namespace ?? 'GSAP'
  const sheetInternal = privateAPI(sheet)
  const sheetKey = sheetAddressKey(sheetInternal.address)
  const sequenceLength = sequenceLengthForSheet(sheet)

  refreshGsapScrollTriggers()

  const extracted = extractScrollTriggerLayout(st, {
    sequenceLength,
    id: options.id,
    label: options.label,
    fallbackIndex,
  })

  if (!extracted.ok) {
    if (extracted.reason === 'unsupported_scroller') {
      console.warn(
        `[theatre-gsap] Skipped ScrollTrigger "${options.label}": only document vertical scroll triggers are supported in page mode.`,
      )
    } else {
      console.warn(
        `[theatre-gsap] Skipped ScrollTrigger "${options.label}": no linked tween or timeline found.`,
      )
    }
    return null
  }

  const {value} = extracted
  const objectKey = scrollTriggerObjectKey(namespace, value.label)
  const id = options.id ?? value.id

  const sheetObjectPublic = sheet.object(objectKey, {}, {reconfigure: false})
  const sheetObjectInternal = privateAPI(sheetObjectPublic)

  if (config.outlineNamespace) {
    privateAPI(sheet).template.setOutlineNamespaceConfig(
      formatOutlineNamespacePathKey([namespace]),
      config.outlineNamespace,
    )
  }

  const entry: GsapScrollTriggerRegistryEntry = {
    id,
    label: value.label,
    scrollTrigger: st,
    sheetObject: sheetObjectInternal,
    layout: value.layout,
    kind: value.kind,
    animationSpanSeconds: value.animationSpanSeconds,
    timelineChildren: value.timelineChildren,
  }

  registerScrollTriggerInRegistry(sheetKey, entry)

  return {id, sheetObject: sheetObjectPublic}
}

/**
 * Registers a GSAP ScrollTrigger for read-only visualization on the page-mode sequencer.
 */
export function registerGsapScrollTrigger(
  scrollTrigger: GsapScrollTriggerLike,
  sheet: ISheet,
  options: RegisterGsapScrollTriggerOptions,
): RegisterGsapScrollTriggerResult {
  assertPageMode(sheet)
  requireGsapScrollTriggerPlugin()

  const result = registerOneGsapScrollTriggerOnSheet(
    sheet,
    scrollTrigger,
    options,
    0,
  )
  if (!result) {
    throw new Error(
      `Could not register ScrollTrigger "${options.label}". See console warnings for details.`,
    )
  }
  return result
}

/**
 * Re-reads layout for all scroll triggers registered on this sheet (after ST refresh / resize).
 */
export function refreshRegisteredGsapScrollTriggerLayouts(sheet: ISheet): void {
  if (sheet.getSequenceMode() !== 'page') return
  const sheetInternal = privateAPI(sheet)
  const sheetKey = sheetAddressKey(sheetInternal.address)
  refreshScrollTriggerLayoutsForSheet(sheetKey, sequenceLengthForSheet(sheet))
}
