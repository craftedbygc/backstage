import type Sheet from '@unseenco/theatre-core/sheets/Sheet'
import {
  clampSequenceEditorPosition,
  limitGsapClipMoveStart,
  limitGsapClipResizeEndDuration,
  limitGsapClipResizeStart,
} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/sequenceEditLimits'

const sheetStub = {
  getSequence: () => ({length: 100, pointer: {length: {}}}),
} as unknown as Sheet

jest.mock('@unseenco/theatre-studio/utils/activeSequenceVariant', () => ({
  getStudioSequence: () => ({length: 100}),
}))

describe('sequenceEditLimits', () => {
  test('clampSequenceEditorPosition stops at sequence end', () => {
    expect(clampSequenceEditorPosition(-2, sheetStub)).toBe(0)
    expect(clampSequenceEditorPosition(50, sheetStub)).toBe(50)
    expect(clampSequenceEditorPosition(120, sheetStub)).toBe(100)
  })

  test('limitGsapClipMoveStart does not change duration', () => {
    expect(limitGsapClipMoveStart(95, 20, sheetStub)).toBe(80)
    expect(limitGsapClipMoveStart(120, 15, sheetStub)).toBe(85)
  })

  test('limitGsapClipResizeEndDuration does not change start', () => {
    expect(limitGsapClipResizeEndDuration(90, 25, sheetStub)).toBe(10)
    expect(limitGsapClipResizeEndDuration(90, 5, sheetStub)).toBe(5)
  })

  test('limitGsapClipResizeStart keeps end fixed until cap', () => {
    expect(limitGsapClipResizeStart(50, 70, sheetStub)).toEqual({
      start: 50,
      duration: 20,
    })
    expect(limitGsapClipResizeStart(65, 70, sheetStub)).toEqual({
      start: 65,
      duration: 5,
    })
  })
})
