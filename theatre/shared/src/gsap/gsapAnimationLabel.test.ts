import {
  readGsapAnimationVarsId,
  resolveGsapAnimationRegistrationLabel,
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
})
