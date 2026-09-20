import type {CoreBits, BackstageCoreBundle} from '@unseenco/backstage/CoreBundle'
import type {Studio} from './Studio'

export default class StudioBundle {
  private _coreBundle: undefined | BackstageCoreBundle
  constructor(private readonly _studio: Studio) {}
  get type(): 'Backstage_StudioBundle' {
    return 'Backstage_StudioBundle'
  }

  registerCoreBundle(coreBundle: BackstageCoreBundle) {
    if (this._coreBundle) {
      throw new Error(
        `StudioBundle.coreBundle is already registered. This is a bug.`,
      )
    }
    this._coreBundle = coreBundle
    let coreBits!: CoreBits

    coreBundle.getBitsForStudio(this._studio, (bits) => {
      coreBits = bits
    })

    this._studio.setCoreBits(coreBits)
  }
}
