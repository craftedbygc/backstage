import type {
  BasicKeyframedTrack,
  Keyframe,
} from '@unseenco/backstage/projects/store/types/SheetState_Historic'
import {
  basicKeyframedTracksEqualForDopeSheetChrome,
  keyframesEqualForDopeSheetChrome,
} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/KeyframeEditor/keyframeDopeSheetVisualEqual'

const base: Keyframe = {
  id: 'kf1' as Keyframe['id'],
  value: 0,
  position: 1,
  handles: [0, 0, 0, 0],
  connectedRight: true,
  type: 'bezier',
}

describe('keyframesEqualForDopeSheetChrome', () => {
  it('ignores value changes', () => {
    expect(keyframesEqualForDopeSheetChrome(base, {...base, value: 42})).toBe(
      true,
    )
  })

  it('detects position changes', () => {
    expect(keyframesEqualForDopeSheetChrome(base, {...base, position: 2})).toBe(
      false,
    )
  })
})

describe('basicKeyframedTracksEqualForDopeSheetChrome', () => {
  const track: BasicKeyframedTrack = {
    type: 'BasicKeyframedTrack',
    keyframes: [
      {
        id: 'kf1' as Keyframe['id'],
        value: 0,
        position: 0,
        handles: [0, 0, 0, 0],
        connectedRight: false,
      },
    ],
  }

  it('ignores keyframe value changes', () => {
    const next: BasicKeyframedTrack = {
      ...track,
      keyframes: [{...track.keyframes[0], value: 99}],
    }
    expect(basicKeyframedTracksEqualForDopeSheetChrome(track, next)).toBe(true)
  })
})
