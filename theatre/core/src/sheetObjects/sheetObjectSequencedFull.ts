import type {InterpolationTriple} from '@unseenco/theatre-core/sequences/interpolationTripleAtPosition'
import interpolationTripleAtPosition from '@unseenco/theatre-core/sequences/interpolationTripleAtPosition'
import type {SequenceTrackId} from '@unseenco/backstage-shared/utils/ids'
import pointerDeep from '@unseenco/backstage-shared/utils/pointerDeep'
import type {$IntentionalAny} from '@unseenco/backstage-shared/utils/types'
import {Atom, prism, val} from '@unseenco/theatre-dataverse'
import type {Pointer, Prism} from '@unseenco/theatre-dataverse'
import type {
  Interpolator,
  PropTypeConfig,
} from '@unseenco/theatre-core/propTypes'
import {getPropConfigByPath} from '@unseenco/backstage-shared/propTypes/utils'
import {pointerToSequenceTrackData} from '@unseenco/theatre-core/sequences/sequenceVariants'
import type {SequenceVariantId} from '@unseenco/theatre-core/sequences/sequenceVariants'
import {DEFAULT_SEQUENCE_VARIANT} from '@unseenco/theatre-core/sequences/sequenceVariants'
import {isSheetPropsObjectKey} from '@unseenco/backstage-shared/utils/sheetProps'
import deepMergeWithCache from '@unseenco/backstage-shared/utils/deepMergeWithCache'
import type {SerializableMap} from '@unseenco/backstage-shared/utils/types'
import type SheetObject from './SheetObject'

type SheetObjectPropsValue = SerializableMap

function trackIdToPrism(
  obj: SheetObject,
  trackId: SequenceTrackId,
  trackVariant: SequenceVariantId,
): Prism<InterpolationTriple | undefined> {
  const activeVariant = val(obj.sheet.effectiveActiveSequenceVariantD)
  const trackP = pointerToSequenceTrackData(
    obj.template.project.pointers.historic.sheetsById[obj.address.sheetId],
    trackVariant,
    obj.address.objectKey,
    trackId,
  )

  const timeD = obj.sheet.getSequence(activeVariant).positionPrism

  return interpolationTripleAtPosition(obj._internalUtilCtx, trackP, timeD)
}

function getSequencedValues(
  obj: SheetObject,
): Prism<Pointer<SheetObjectPropsValue>> {
  return prism(() => {
    const activeVariant = val(obj.sheet.effectiveActiveSequenceVariantD)
    const sequenceVariant = isSheetPropsObjectKey(obj.address.objectKey)
      ? DEFAULT_SEQUENCE_VARIANT
      : activeVariant

    const tracksToProcessD = prism.memo(
      'tracksToProcess',
      () => obj.template.getArrayOfValidSequenceTracks(sequenceVariant),
      [sequenceVariant],
    )

    const tracksToProcess = val(tracksToProcessD)
    const valsAtom = new Atom<SheetObjectPropsValue>({})
    const config = val(obj.template.configPointer)

    prism.effect(
      'processTracks',
      () => {
        const untaps: Array<() => void> = []

        for (const {trackId, pathToProp, trackVariant} of tracksToProcess) {
          if (obj.template.isNonSequencablePropPath(pathToProp)) continue

          const pr = trackIdToPrism(obj, trackId, trackVariant)
          const propConfig = getPropConfigByPath(
            config,
            pathToProp,
          )! as Extract<PropTypeConfig, {interpolate: $IntentionalAny}>

          const deserializeAndSanitize = propConfig.deserializeAndSanitize
          const interpolate =
            propConfig.interpolate! as Interpolator<$IntentionalAny>

          const updateSequenceValueFromItsPrism = () => {
            const triple = pr.getValue()

            if (!triple)
              return valsAtom.setByPointer(
                (p) => pointerDeep(p, pathToProp),
                undefined,
              )

            const leftDeserialized = deserializeAndSanitize(triple.left)

            const left =
              leftDeserialized === undefined
                ? propConfig.default
                : leftDeserialized

            if (triple.right === undefined)
              return valsAtom.setByPointer(
                (p) => pointerDeep(p, pathToProp),
                left,
              )

            const rightDeserialized = deserializeAndSanitize(triple.right)
            const right =
              rightDeserialized === undefined
                ? propConfig.default
                : rightDeserialized

            return valsAtom.setByPointer(
              (p) => pointerDeep(p, pathToProp),
              interpolate(left, right, triple.progression),
            )
          }
          const untap = pr.onStale(updateSequenceValueFromItsPrism)

          updateSequenceValueFromItsPrism()
          untaps.push(untap)
        }
        return () => {
          for (const untap of untaps) {
            untap()
          }
        }
      },
      [config, ...tracksToProcess],
    )

    return valsAtom.pointer
  })
}

export function mergeSequencedValuesIntoFinal(
  obj: SheetObject,
  base: SheetObjectPropsValue,
  withSeqsCache: WeakMap<object, WeakMap<object, object>>,
): SheetObjectPropsValue {
  const pointerToSequencedValuesD = prism.memo(
    'seq',
    () => getSequencedValues(obj),
    [],
  )
  const sequenced = val(val(pointerToSequencedValuesD))
  return deepMergeWithCache(base, sequenced, withSeqsCache)
}
