import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'

export type NearbyKeyframes = Record<string, never>

export function normalizeSequencePosition(position: number): number {
  return parseFloat(position.toFixed(3))
}

export function sequencePositionsEqual(a: number, b: number): boolean {
  return normalizeSequencePosition(a) === normalizeSequencePosition(b)
}

export function getNearbyKeyframesOfTrack(
  _obj: SheetObject,
  _track: unknown,
  _sequencePosition: number,
): NearbyKeyframes {
  return {}
}
