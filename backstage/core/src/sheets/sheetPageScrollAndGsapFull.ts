import {attachGsapSequenceBridge} from '@unseenco/backstage/gsap/attachGsapSequenceBridge'
import type {ScrollDriver} from '@unseenco/backstage/sheets/attachSheetScrollDriver'
import {
  attachSheetScrollDriver,
  createNativeDocumentScrollDriver,
} from '@unseenco/backstage/sheets/attachSheetScrollDriver'
import type Sheet from './Sheet'

export function syncPageScrollDriverForSheet(host: Sheet): void {
  host._pageScrollDisposer?.()
  host._pageScrollDisposer = undefined
  if (host.getSequenceMode() === 'page') {
    const driver =
      host._customPageScrollDriver ?? createNativeDocumentScrollDriver()
    host._pageScrollDisposer = attachSheetScrollDriver(host.publicApi, driver)
  }
}

export function reattachGsapBridgeForSheet(host: Sheet): void {
  if (host._gsapBridgeDisposer) {
    host._gsapBridgeDisposer()
    host._gsapBridgeDisposer = attachGsapSequenceBridge(host.publicApi)
  }
}

export function enableGsapSequenceBridgeForSheet(host: Sheet): void {
  if (host._gsapBridgeDisposer) return
  host._gsapBridgeDisposer = attachGsapSequenceBridge(host.publicApi)
  syncPageScrollDriverForSheet(host)
}

export function disposeRuntimeIntegrationsForSheet(host: Sheet): void {
  host._pageScrollDisposer?.()
  host._pageScrollDisposer = undefined
  host._gsapBridgeDisposer?.()
  host._gsapBridgeDisposer = undefined
}

export function setPageScrollDriverForSheet(
  host: Sheet,
  driver: ScrollDriver | undefined,
): void {
  host._customPageScrollDriver = driver
  syncPageScrollDriverForSheet(host)
}
