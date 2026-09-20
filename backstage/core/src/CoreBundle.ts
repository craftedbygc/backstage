import type {Studio} from '@unseenco/backstage/studio/Studio'
import projectsSingleton from './projects/projectsSingleton'
import {privateAPI} from './privateAPIs'
import * as fullCoreExports from './coreExports'
import * as liteCoreExports from './coreExports-lite'
import {getCoreRafDriver} from './coreTicker'
import {isBackstageLiteMode} from './utils/isBackstageLiteMode'
import type {CoreBits, BackstageCoreBundle} from './coreBundleTypes'

const coreExports = isBackstageLiteMode() ? liteCoreExports : fullCoreExports

export default class CoreBundle implements BackstageCoreBundle {
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

export type {CoreBits, BackstageCoreBundle} from './coreBundleTypes'
