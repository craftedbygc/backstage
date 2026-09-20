import type {Studio} from '@unseenco/theatre-studio/Studio'
import projectsSingleton from './projects/projectsSingleton'
import {privateAPI} from './privateAPIs'
import * as fullCoreExports from './coreExports'
import * as liteCoreExports from './coreExports-lite'
import {getCoreRafDriver} from './coreTicker'
import {isTheatreLiteMode} from './utils/isTheatreLiteMode'
import type {CoreBits, TheatreCoreBundle} from './coreBundleTypes'

const coreExports = isTheatreLiteMode() ? liteCoreExports : fullCoreExports

export default class CoreBundle implements TheatreCoreBundle {
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
        `@unseenco/theatre-core is already attached to @unseenco/theatre-core/studio`,
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

export type {CoreBits, TheatreCoreBundle} from './coreBundleTypes'
