/**
 * Entry point for `@unseenco/theatre-core/core-lite` (`dist/index-lite.*`).
 * Built with `__THEATRE_LITE__: true` — no sequence interpolation or playback.
 *
 * @packageDocumentation
 */

import './theatreLiteRuntimeFlag'

export * from './coreExports-lite'
export type {
  IProject,
  IProjectConfig,
  ISheetOptions,
} from './projects/TheatreProject'
export type {ISequence} from './sequences/TheatreSequence'
export type {ISheetObject} from './sheetObjects/TheatreSheetObject'
export type {ISheet, ISheetObjectOptions} from './sheets/TheatreSheet'
export type {UnknownShorthandCompoundProps} from './propTypes'
import * as globalVariableNames from '@unseenco/backstage-shared/globalVariableNames'
import type StudioBundle from '@unseenco/theatre-studio/StudioBundle'
import CoreBundleLite from './CoreBundleLite'
import type {TheatreCoreBundle} from './coreBundleTypes'
import type {OnDiskState} from './projects/store/storeTypes'

/**
 * NOTE: **INTERNAL and UNSTABLE** - This _WILL_ break between minor versions.
 */
export type __UNSTABLE_Project_OnDiskState = OnDiskState

registerCoreBundle()

function registerCoreBundle() {
  if (typeof window == 'undefined') return

  const existingBundle: TheatreCoreBundle | undefined =
    // @ts-ignore ignore
    window[globalVariableNames.coreBundle]

  if (typeof existingBundle !== 'undefined') {
    if (
      typeof existingBundle === 'object' &&
      existingBundle &&
      typeof existingBundle.version === 'string'
    ) {
      throw new Error(
        `It seems that the module '@unseenco/theatre-core' is loaded more than once. This could have two possible causes:\n` +
          `1. You might have two separate versions of Theatre.js in node_modules.\n` +
          `2. Or this might be a bundling misconfiguration, in case you're using a bundler like Webpack/ESBuild/Rollup.\n\n` +
          `Note that it **is okay** to import '@unseenco/theatre-core' multiple times. But those imports should point to the same module.`,
      )
    } else {
      throw new Error(
        `The variable window.${globalVariableNames.coreBundle} seems to be already set by a module other than @unseenco/theatre-core.`,
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
    possibleExistingStudioBundle.type === 'Theatre_StudioBundle'
  ) {
    possibleExistingStudioBundle.registerCoreBundle(coreBundle)
  }
}
