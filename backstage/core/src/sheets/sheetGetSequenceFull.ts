import Sequence from '@unseenco/backstage/sequences/Sequence'
import type {SequenceVariantId} from '@unseenco/backstage/sequences/sequenceVariants'
import {getSequenceStateFromSheet} from '@unseenco/backstage/sequences/sequenceVariants'
import type Sheet from './Sheet'
import {prism, val} from '@unseenco/backstage/dataverse'
import {isInteger} from 'lodash-es'
import {
  PAGE_MODE_SEQUENCE_LENGTH,
  PAGE_MODE_SUB_UNITS_PER_UNIT,
} from '@unseenco/backstage/sheets/sheetSequenceMode'

const sanitizeSequenceLength = (len: number | undefined): number =>
  typeof len === 'number' && isFinite(len) && len > 0 ? len : 10

const sanitizeSequenceSubUnitsPerUnit = (subs: number | undefined): number =>
  typeof subs === 'number' && isInteger(subs) && subs > 0 ? subs : 30

export function getOrCreateFullSequence(
  sheet: Sheet,
  sequences: Record<string, Sequence>,
  variantId: SequenceVariantId,
): Sequence {
  if (!sequences[variantId]) {
    const lengthD = prism(() => {
      if (val(sheet.sequenceModeP) === 'page') {
        return PAGE_MODE_SEQUENCE_LENGTH
      }
      const sheetState = val(
        sheet.project.pointers.historic.sheetsById[sheet.address.sheetId],
      )
      const unsanitized = getSequenceStateFromSheet(
        sheetState,
        variantId,
      )?.length
      return sanitizeSequenceLength(unsanitized)
    })

    const subUnitsPerUnitD = prism(() => {
      if (val(sheet.sequenceModeP) === 'page') {
        return PAGE_MODE_SUB_UNITS_PER_UNIT
      }
      const sheetState = val(
        sheet.project.pointers.historic.sheetsById[sheet.address.sheetId],
      )
      const unsanitized = getSequenceStateFromSheet(
        sheetState,
        variantId,
      )?.subUnitsPerUnit
      return sanitizeSequenceSubUnitsPerUnit(unsanitized)
    })

    sequences[variantId] = new Sequence(
      sheet.template.project,
      sheet,
      lengthD,
      subUnitsPerUnitD,
      variantId,
    )
  }
  return sequences[variantId]!
}
