import type {SequenceVariantId} from '@unseenco/theatre-core/sequences/sequenceVariants'
import type Sequence from '@unseenco/theatre-core/sequences/Sequence'
import type Sheet from './Sheet'

/** Lite bundle stub — full sequence factory is not shipped in core-lite. */
export function getOrCreateFullSequence(
  _sheet: Sheet,
  _sequences: Record<string, Sequence>,
  _variantId: SequenceVariantId,
): Sequence {
  throw new Error(
    'Full sequence playback is not available in @unseenco/theatre-core/core-lite',
  )
}
