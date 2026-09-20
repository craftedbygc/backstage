import type {SequenceVariantId} from '@unseenco/backstage/sequences/sequenceVariants'
import type Sequence from '@unseenco/backstage/sequences/Sequence'
import type Sheet from './Sheet'

/** Lite bundle stub — full sequence factory is not shipped in core-lite. */
export function getOrCreateFullSequence(
  _sheet: Sheet,
  _sequences: Record<string, Sequence>,
  _variantId: SequenceVariantId,
): Sequence {
  throw new Error(
    'Full sequence playback is not available in @unseenco/backstage/core-lite',
  )
}
