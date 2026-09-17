import {gsapTimelineChildClipInSequenceSpace} from './gsapTimelineChildBarLayout'

describe('gsapTimelineChildClipInSequenceSpace', () => {
  test('maps child local timing into parent sequence span', () => {
    const parent = {start: 2, duration: 4}
    const child = {localStart: 1, localDuration: 1, childId: 'c0', label: 'A'}
    expect(gsapTimelineChildClipInSequenceSpace(parent, child, 4)).toEqual({
      start: 3,
      duration: 1,
    })
  })
})
