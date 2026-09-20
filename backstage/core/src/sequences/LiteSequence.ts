import type {Prism} from '@unseenco/backstage/dataverse'
import {prism} from '@unseenco/backstage/dataverse'
import BackstageSequenceLite from './BackstageSequenceLite'

/**
 * Minimal internal sequence stand-in for core-lite (`Sheet.getSequence()`).
 */
export default class LiteSequence {
  readonly publicApi = new BackstageSequenceLite()
  readonly positionPrism: Prism<number> = prism(() => 0)

  pause(): void {}
}
