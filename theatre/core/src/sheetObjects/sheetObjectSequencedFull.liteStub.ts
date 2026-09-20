import type {SerializableMap} from '@unseenco/backstage-shared/utils/types'
import type SheetObject from './SheetObject'

type SheetObjectPropsValue = SerializableMap

/** Lite bundle stub — sequenced value merge is not shipped in core-lite. */
export function mergeSequencedValuesIntoFinal(
  _obj: SheetObject,
  base: SheetObjectPropsValue,
  _withSeqsCache: WeakMap<object, WeakMap<object, object>>,
): SheetObjectPropsValue {
  return base
}
