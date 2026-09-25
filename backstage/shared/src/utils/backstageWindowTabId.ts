import {crossBundleSingleton} from '@unseenco/backstage-shared/utils/crossBundleSingleton'
import {nanoid} from 'nanoid/non-secure'

/**
 * Stable per-browser-tab id shared across core, gsap, and Studio bundles.
 * Used for remote editor sync routing.
 */
export function getBackstageWindowTabId(): string {
  return crossBundleSingleton('window_tab_id', () => nanoid())
}
