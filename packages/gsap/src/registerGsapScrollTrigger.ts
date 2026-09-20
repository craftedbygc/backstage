import type {ISheet} from '@unseenco/backstage'
import {privateAPI} from '@unseenco/backstage/privateAPIs'
import {buildGsapSheetObjectKey} from '@unseenco/backstage-shared/gsap/buildGsapSheetObjectKey'
import {extractScrollTriggerLayout} from '@unseenco/backstage-shared/gsap/extractScrollTriggerLayout'
import {
  findScrollTriggerEntryByInstance,
  registerScrollTriggerInRegistry,
  sheetAddressKey,
} from '@unseenco/backstage-shared/gsap/scrollTriggerRegistry'
import type {GsapScrollTriggerRegistryEntry} from '@unseenco/backstage-shared/gsap/scrollTriggerRegistry'
import {formatOutlineNamespacePathKey} from '@unseenco/backstage-shared/utils/outlineNamespaces'
import {getBackstageGsapConfig} from './config'
import {getBackstagePageScrollContext} from './attachBackstagePageScroll'
import type {GsapScrollTriggerLike} from './gsapScrollTriggerTypes'
import {
  refreshGsapScrollTriggers,
  requireGsapScrollTriggerPlugin,
} from './gsapScrollTriggerPlugin'
import {refreshScrollTriggerLayoutsForSheet} from '@unseenco/backstage-shared/gsap/refreshScrollTriggerLayoutsForSheet'
import {scheduleGsapTickerRafWarningCheck} from './gsapTickerRafBridge'

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
  return buildGsapSheetObjectKey(namespace, `ScrollTriggers / ${label}`)
}

export function registerOneGsapScrollTriggerOnSheet(
  sheet: ISheet,
  st: GsapScrollTriggerLike,
  options: RegisterGsapScrollTriggerOptions,
  fallbackIndex: number,
): RegisterGsapScrollTriggerResult | null {
  const config = getBackstageGsapConfig()
  const namespace = options.namespace ?? config.namespace ?? 'GSAP'
  const sheetInternal = privateAPI(sheet)
  const sheetKey = sheetAddressKey(sheetInternal.address)
  const sequenceLength = sequenceLengthForSheet(sheet)

  const existingByInstance = findScrollTriggerEntryByInstance(sheetKey, st)
  if (existingByInstance?.sheetObject) {
    console.warn(
      `[backstage-gsap] ScrollTrigger "${options.label}" is already registered for this sheet (id "${existingByInstance.id}"). Skipping duplicate registration.`,
    )
    return {
      id: existingByInstance.id,
      sheetObject: existingByInstance.sheetObject.publicApi,
    }
  }

  refreshGsapScrollTriggers()

  const pageScrollContext = getBackstagePageScrollContext()

  const extracted = extractScrollTriggerLayout(st, {
    sequenceLength,
    id: options.id,
    label: options.label,
    fallbackIndex,
    pageScrollContext,
  })

  if (!extracted.ok) {
    if (extracted.reason === 'unsupported_scroller') {
      console.warn(
        `[backstage-gsap] Skipped ScrollTrigger "${options.label}": scroller or scroll axis does not match configured page scroll (see configureBackstageGsap pageScroll scroller and axis).`,
      )
    } else {
      console.warn(
        `[backstage-gsap] Skipped ScrollTrigger "${options.label}": no linked tween or timeline found.`,
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
  scheduleGsapTickerRafWarningCheck()
  return result
}

/**
 * Re-reads layout for all scroll triggers registered on this sheet (after ST refresh / resize).
 */
export function refreshRegisteredGsapScrollTriggerLayouts(sheet: ISheet): void {
  if (sheet.getSequenceMode() !== 'page') return
  const sheetInternal = privateAPI(sheet)
  const sheetKey = sheetAddressKey(sheetInternal.address)
  refreshScrollTriggerLayoutsForSheet(
    sheetKey,
    sequenceLengthForSheet(sheet),
    getBackstagePageScrollContext(),
  )
}
