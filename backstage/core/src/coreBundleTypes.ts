import type {Studio} from '@unseenco/backstage/studio/Studio'
import type projectsSingleton from './projects/projectsSingleton'
import type {privateAPI} from './privateAPIs'
import type * as fullCoreExports from './coreExports'
import type * as liteCoreExports from './coreExports-lite'
import type {getCoreRafDriver} from './coreTicker'

export type CoreExportsNamespace =
  | typeof fullCoreExports
  | typeof liteCoreExports

export type CoreBits = {
  projectsP: typeof projectsSingleton.atom.pointer.projects
  privateAPI: typeof privateAPI
  coreExports: CoreExportsNamespace
  getCoreRafDriver: typeof getCoreRafDriver
}

/** Shared shape for full and lite core bundles (Studio registration). */
export type BackstageCoreBundle = {
  readonly type: 'Backstage_CoreBundle'
  readonly version: string | undefined
  getBitsForStudio(studio: Studio, callback: (bits: CoreBits) => void): void
}
