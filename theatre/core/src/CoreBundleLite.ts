import type {Studio} from '@unseenco/theatre-studio/Studio'
import projectsSingleton from './projects/projectsSingleton'
import {privateAPI} from './privateAPIs'
import * as coreExports from './coreExports-lite'
import {getCoreRafDriver} from './coreTicker'
import type {CoreBits, TheatreCoreBundle} from './coreBundleTypes'

/**
 * Core bundle for `@unseenco/theatre-core-lite` — never imports full `coreExports`.
 */
export default class CoreBundleLite implements TheatreCoreBundle {
  private _studio: Studio | undefined = undefined
  constructor() {}

  get type(): 'Theatre_CoreBundle' {
    return 'Theatre_CoreBundle'
  }

  get version() {
    return process.env.THEATRE_VERSION
  }

  getBitsForStudio(studio: Studio, callback: (bits: CoreBits) => void) {
    if (this._studio) {
      throw new Error(
        `@unseenco/theatre-core is already attached to @unseenco/theatre-studio`,
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
