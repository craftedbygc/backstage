/**
 * Entry point for `@unseenco/backstage/core-lite` (`dist/index-lite.*`).
 * Built with `__BACKSTAGE_LITE__: true` — no sequence interpolation or playback.
 *
 * @packageDocumentation
 */

import './backstageLiteRuntimeFlag'

export * from './coreExports-lite'
export type {
  IProject,
  IProjectConfig,
  ISheetOptions,
} from './projects/BackstageProject'
export type {ISequence} from './sequences/BackstageSequence'
export type {ISheetObject} from './sheetObjects/BackstageSheetObject'
export type {ISheet, ISheetObjectOptions} from './sheets/BackstageSheet'
export type {UnknownShorthandCompoundProps} from './propTypes'
import * as globalVariableNames from '@unseenco/backstage-shared/globalVariableNames'
import type StudioBundle from '@unseenco/backstage/studio/StudioBundle'
import CoreBundleLite from './CoreBundleLite'
import type {BackstageCoreBundle} from './coreBundleTypes'
import type {OnDiskState} from './projects/store/storeTypes'

/**
 * NOTE: **INTERNAL and UNSTABLE** - This _WILL_ break between minor versions.
 */
export type __UNSTABLE_Project_OnDiskState = OnDiskState

registerCoreBundle()

function registerCoreBundle() {
  if (typeof window == 'undefined') return

  const existingBundle: BackstageCoreBundle | undefined =
    // @ts-ignore ignore
    window[globalVariableNames.coreBundle]

  if (typeof existingBundle !== 'undefined') {
    if (
      typeof existingBundle === 'object' &&
      existingBundle &&
      typeof existingBundle.version === 'string'
    ) {
      throw new Error(
        `It seems that the module '@unseenco/backstage' is loaded more than once. This could have two possible causes:\n` +
          `1. You might have two separate versions of Backstage.js in node_modules.\n` +
          `2. Or this might be a bundling misconfiguration, in case you're using a bundler like Webpack/ESBuild/Rollup.\n\n` +
          `Note that it **is okay** to import '@unseenco/backstage' multiple times. But those imports should point to the same module.`,
      )
    } else {
      throw new Error(
        `The variable window.${globalVariableNames.coreBundle} seems to be already set by a module other than @unseenco/backstage.`,
      )
    }
  }

  const coreBundle = new CoreBundleLite()

  // @ts-ignore ignore
  window[globalVariableNames.coreBundle] = coreBundle

  const possibleExistingStudioBundle: undefined | StudioBundle =
    // @ts-ignore ignore
    window[globalVariableNames.studioBundle]

  if (
    possibleExistingStudioBundle &&
    possibleExistingStudioBundle !== null &&
    possibleExistingStudioBundle.type === 'Backstage_StudioBundle'
  ) {
    possibleExistingStudioBundle.registerCoreBundle(coreBundle)
  }
}
