/**
 * The library providing the runtime functionality of Backstage.js.
 *
 * @packageDocumentation
 */

export * from './coreExports'
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
import CoreBundle from './CoreBundle'
import type {OnDiskState} from './projects/store/storeTypes'

/**
 * NOTE: **INTERNAL and UNSTABLE** - This _WILL_ break between minor versions.
 *
 * This type represents the object returned by `studio.createContnentOfSaveFile()`. It's
 * meant for advanced users who want to interact with the state of projects. In the vast
 * majority of cases, you __should not__ use this type. Either an API for your use-case
 * already exists, or you should open an issue on GitHub: https://github.com/craftedbygc/backstage/issues
 *
 */
export type __UNSTABLE_Project_OnDiskState = OnDiskState

registerCoreBundle()

/**
 * @remarks
 * the studio and core need to communicate with each other somehow, and currently we do that
 * by registering each of them as a global variable. This function does the work of registering
 * the core bundle (everything exported from `@unseenco/backstage`) to window.__BackstageJS_CoreBundle.
 */
function registerCoreBundle() {
  // This only works in a browser environment
  if (typeof window == 'undefined') return

  // `@unseenco/backstage/core-lite` sets this before registering. If the bundler
  // also resolves a stray full-core entry (mis-alias), skip a second registration.
  if (
    (globalThis as typeof globalThis & {__BACKSTAGE_FORCE_LITE__?: boolean})
      .__BACKSTAGE_FORCE_LITE__
  ) {
    const liteBundle: CoreBundle | undefined =
      // @ts-ignore ignore
      window[globalVariableNames.coreBundle]
    if (liteBundle) {
      return
    }
  }

  // another core bundle may already be registered

  const existingBundle: CoreBundle | undefined =
    // @ts-ignore ignore
    window[globalVariableNames.coreBundle]

  if (typeof existingBundle !== 'undefined') {
    if (
      typeof existingBundle === 'object' &&
      existingBundle &&
      typeof existingBundle.version === 'string'
    ) {
      /*
      Another core bundle is registered. This usually means the bundler is not configured correctly and
      is bundling `@unseenco/backstage` multiple times, but, there are legitimate scenarios where a user may want
      to include multiple instances of `@unseenco/backstage` on the same page.

      For example, an article might embed two separate interactive graphics that
      are made by different teams (and even different tech stacks -- one in JS, the other in clojurescript).

      If both of those graphics use Backstage.js, our current setup makes them conflict with one another.

      ----------------------
      --------------------
      ----------------------
      -------.

      |   /\_/\   |
      |  ( o.o )  |      --------> graphic1 made with JS+Backstage.js
      |   > ^ <   |

      ## ---
      ----------------------
      --------------------
      ----------------------
      -------.

      |    __      _   |
      |  o'')}____//   | --------> graphic2 made with clojurescript+Backstage.js
      |  `_/      )    |
      |  (_(_/-(_/     |
      
      ---------------------
      -----♥.

      @todo Make it possible to have multiple separate bundles on the same page, but still communicate
      that there is more than one bundle so we can warn the user about bundler misconfiguration.
      
      */
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

  const coreBundle = new CoreBundle()

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
