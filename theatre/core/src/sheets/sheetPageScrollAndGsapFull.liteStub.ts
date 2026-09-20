import type {ScrollDriver} from '@unseenco/theatre-core/sheets/attachSheetScrollDriver'
import type Sheet from './Sheet'

/** Lite bundle stubs — scroll/GSAP sequence drivers are not shipped in core-lite. */

export function syncPageScrollDriverForSheet(_host: Sheet): void {}

export function reattachGsapBridgeForSheet(_host: Sheet): void {}

export function enableGsapSequenceBridgeForSheet(_host: Sheet): void {}

export function disposeRuntimeIntegrationsForSheet(_host: Sheet): void {}

export function setPageScrollDriverForSheet(
  _host: Sheet,
  _driver: ScrollDriver | undefined,
): void {}
