/**
 * The library providing the editor components of Backstage.js.
 *
 * @packageDocumentation
 */

import {setStudio} from '@unseenco/backstage/studio/getStudio'
import {Studio} from '@unseenco/backstage/studio/Studio'

import * as globalVariableNames from '@unseenco/backstage-shared/globalVariableNames'
import type {$FixMe} from '@unseenco/backstage-shared/utils/types'
import StudioBundle from './StudioBundle'
import type CoreBundle from '@unseenco/backstage/CoreBundle'
import type {IStudio} from '@unseenco/backstage/studio/BackstageStudio'

const studioPrivateAPI = new Studio()
setStudio(studioPrivateAPI)

/**
 * The main instance of Studio. Read more at {@link IStudio}
 */
const studio: IStudio = studioPrivateAPI.publicApi

export default studio

registerStudioBundle()

function registerStudioBundle() {
  if (typeof window == 'undefined') return

  const existingStudioBundle = (window as $FixMe)[
    globalVariableNames.studioBundle
  ]

  if (typeof existingStudioBundle !== 'undefined') {
    if (
      typeof existingStudioBundle === 'object' &&
      existingStudioBundle &&
      typeof existingStudioBundle.version === 'string'
    ) {
      throw new Error(
        `It seems that the module '@unseenco/backstage/studio' is loaded more than once. This could have two possible causes:\n` +
          `1. You might have two separate versions of Backstage.js in node_modules.\n` +
          `2. Or this might be a bundling misconfiguration, in case you're using a bundler like Webpack/ESBuild/Rollup.\n\n` +
          `Note that it **is okay** to import '@unseenco/backstage/studio' multiple times. But those imports should point to the same module.`,
      )
    } else {
      throw new Error(
        `The variable window.${globalVariableNames.studioBundle} seems to be already set by a module other than @unseenco/backstage.`,
      )
    }
  }

  const studioBundle = new StudioBundle(studioPrivateAPI)

  // @ts-ignore ignore
  window[globalVariableNames.studioBundle] = studioBundle

  const possibleCoreBundle: undefined | CoreBundle =
    // @ts-ignore ignore
    window[globalVariableNames.coreBundle]

  if (
    possibleCoreBundle &&
    possibleCoreBundle !== null &&
    possibleCoreBundle.type === 'Backstage_CoreBundle'
  ) {
    studioBundle.registerCoreBundle(possibleCoreBundle)
  }
}

// export {default as ToolbarSwitchSelect} from './uiComponents/toolbar/ToolbarSwitchSelect'
// export {default as ToolbarIconButton} from './uiComponents/toolbar/ToolbarIconButton'
/** Studio toolbar dropdown control for extension authors building custom toolsets. */
export {default as ToolbarDropdownSelect} from './uiComponents/toolbar/ToolbarDropdownSelect'

import {notify} from '@unseenco/backstage/studio/notify'

if (typeof window !== 'undefined') {
  // @ts-ignore
  window[globalVariableNames.notifications] = {
    notify,
  }
}

export {
  isRemoteEditorOpen,
  onRemoteEditorOpenChange,
} from '@unseenco/backstage/studio/remoteEditor'

/**
 * Returns the Studio singleton. Extension packages (e.g. `@unseenco/backstage/threejs`)
 * import this from `@unseenco/backstage/studio` so they share the same instance as the
 * default export.
 */
export {default as getStudio, setStudio} from './getStudio'

/** Compare live Studio state to on-disk project JSON (`config.state`). */
export {
  projectHasDivergedFromSavedState,
  studioHasDivergedFromSavedState,
} from './propEditors/projectHasDivergedFromSavedState'
export {
  objectHasDivergedFromSavedState,
  sheetObjectDivergesFromSavedState,
} from './propEditors/objectHasDivergedFromSavedState'

export type {IScrub} from '@unseenco/backstage/studio/Scrub'
export type {
  IStudio,
  IExtension,
  PaneInstance,
  PaneClassDefinition,
  IStudioUI,
  IDockedViewport,
  _StudioInitializeOpts,
  ToolsetConfig,
  ToolConfig,
  ToolConfigIcon,
  ToolConfigSwitch,
} from '@unseenco/backstage/studio/BackstageStudio'
