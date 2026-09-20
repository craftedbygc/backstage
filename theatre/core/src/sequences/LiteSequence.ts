import type {Prism} from '@unseenco/theatre-dataverse'
import {prism} from '@unseenco/theatre-dataverse'
import TheatreSequenceLite from './TheatreSequenceLite'

/**
 * Minimal internal sequence stand-in for core-lite (`Sheet.getSequence()`).
 */
export default class LiteSequence {
  readonly publicApi = new TheatreSequenceLite()
  readonly positionPrism: Prism<number> = prism(() => 0)

  pause(): void {}
}
