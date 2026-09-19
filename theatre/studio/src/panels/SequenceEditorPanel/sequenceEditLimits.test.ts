import type Sheet from '@unseenco/theatre-core/sheets/Sheet'
import {
  clampGsapClipTiming,
  clampSequenceEditorPosition,
} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/sequenceEditLimits'

const sheetStub = {
  getSequence: () => ({length: 100, pointer: {length: {}}}),
} as unknown as Sheet

jest.mock('@unseenco/theatre-studio/utils/activeSequenceVariant', () => ({
  getStudioSequence: () => ({length: 100}),
}))

describe('sequenceEditLimits', () => {
  test('clampSequenceEditorPosition respects 0 and sequence length', () => {
    expect(clampSequenceEditorPosition(-2, sheetStub)).toBe(0)
    expect(clampSequenceEditorPosition(50, sheetStub)).toBe(50)
    expect(clampSequenceEditorPosition(120, sheetStub)).toBe(100)
  })

  test('clampGsapClipTiming keeps clip end within sequence length', () => {
    expect(clampGsapClipTiming(90, 20, sheetStub)).toEqual({
      start: 90,
      duration: 10,
    })
    expect(clampGsapClipTiming(95, 10, sheetStub)).toEqual({
      start: 95,
      duration: 5,
    })
  })
})
