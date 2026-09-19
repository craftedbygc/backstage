import {
  readGsapAnimationVarsId,
  resolveGsapAnimationRegistrationLabel,
  resolveGsapTimelineChildSequencerLabel,
} from './gsapAnimationLabel'

describe('gsapAnimationLabel', () => {
  test('readGsapAnimationVarsId reads tween vars.id', () => {
    expect(readGsapAnimationVarsId({vars: {id: 'hero-move'}})).toBe('hero-move')
    expect(readGsapAnimationVarsId({vars: {}})).toBeUndefined()
  })

  test('resolveGsapAnimationRegistrationLabel prefers explicit label', () => {
    expect(
      resolveGsapAnimationRegistrationLabel(
        {vars: {id: 'from-vars'}},
        'Explicit',
      ),
    ).toBe('Explicit')
  })

  test('resolveGsapAnimationRegistrationLabel falls back to vars.id', () => {
    expect(
      resolveGsapAnimationRegistrationLabel(
        {vars: {id: 'from-vars'}},
        undefined,
      ),
    ).toBe('from-vars')
  })

  test('resolveGsapTimelineChildSequencerLabel uses child tween vars.id', () => {
    const timeline = {
      getChildren: () => [
        {vars: {id: 'move-x'}, startTime: () => 0, duration: () => 1},
        {vars: {id: 'spin'}, startTime: () => 1, duration: () => 0.5},
      ],
    }
    expect(
      resolveGsapTimelineChildSequencerLabel(timeline, {
        childId: 'child_0',
        label: 'Tween 1',
      }),
    ).toBe('move-x')
    expect(
      resolveGsapTimelineChildSequencerLabel(timeline, {
        childId: 'child_1',
        label: 'Tween 2',
      }),
    ).toBe('spin')
  })
})
