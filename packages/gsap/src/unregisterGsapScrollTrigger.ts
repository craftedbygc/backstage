import type {ISheet} from '@unseenco/backstage'
import {privateAPI} from '@unseenco/backstage/privateAPIs'
import {unregisterScrollTriggerOnSheet} from '@unseenco/backstage-shared/gsap/scrollTriggerRegistry'

export type UnregisterGsapScrollTriggerOptions = {
  id: string
}

/**
 * Removes a ScrollTrigger registration from the shared registry.
 * {@link ISheet.unload} and {@link ISheet.detachObject} clear these automatically.
 */
export function unregisterGsapScrollTrigger(
  sheet: ISheet,
  options: UnregisterGsapScrollTriggerOptions,
): void {
  unregisterScrollTriggerOnSheet(privateAPI(sheet).address, options.id)
}
