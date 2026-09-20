import type {Studio} from '@unseenco/backstage/studio/Studio'
import projectsSingleton from './projects/projectsSingleton'
import {privateAPI} from './privateAPIs'
import * as coreExports from './coreExports-lite'
import {getCoreRafDriver} from './coreTicker'
import type {CoreBits, BackstageCoreBundle} from './coreBundleTypes'

/**
 * Core bundle for `@unseenco/backstage/core-lite` — never imports full `coreExports`.
 */
export default class CoreBundleLite implements BackstageCoreBundle {
  private _studio: Studio | undefined = undefined
  constructor() {}

  get type(): 'Backstage_CoreBundle' {
    return 'Backstage_CoreBundle'
  }

  get version() {
    return process.env.BACKSTAGE_VERSION
  }

  getBitsForStudio(studio: Studio, callback: (bits: CoreBits) => void) {
    if (this._studio) {
      throw new Error(
        `@unseenco/backstage is already attached to @unseenco/backstage/studio`,
      )
    }
    this._studio = studio
    const bits: CoreBits = {
      projectsP: projectsSingleton.atom.pointer.projects,
      privateAPI: privateAPI,
      coreExports,
      getCoreRafDriver,
    }

    callback(bits)
  }
}

export type {CoreBits} from './coreBundleTypes'
