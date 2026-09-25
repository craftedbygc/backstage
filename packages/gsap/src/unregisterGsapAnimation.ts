import type {ISheet} from '@unseenco/backstage'
import {privateAPI} from '@unseenco/backstage/privateAPIs'
import {unregisterAnimationOnSheet} from '@unseenco/backstage-shared/gsap/gsapAnimationRegistry'

export type UnregisterGsapAnimationOptions = {
  id: string
}

/**
 * Removes a GSAP animation registered with {@link registerGsapAnimation} from the
 * shared registry. Prefer letting {@link ISheet.unload} / {@link ISheet.detachObject}
 * clear registrations automatically.
 */
export function unregisterGsapAnimation(
  sheet: ISheet,
  options: UnregisterGsapAnimationOptions,
): void {
  unregisterAnimationOnSheet(privateAPI(sheet).address, options.id)
}
