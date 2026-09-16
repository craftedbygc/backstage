import {
  isGsapSheetObjectKey,
  setConfiguredGsapSheetObjectNamespace,
} from './gsapSheetObjectKey'

describe('isGsapSheetObjectKey', () => {
  afterEach(() => {
    setConfiguredGsapSheetObjectNamespace('GSAP')
  })

  test('matches Theatre-sanitised slashed keys', () => {
    expect(isGsapSheetObjectKey('GSAP / Panel show')).toBe(true)
    expect(isGsapSheetObjectKey('GSAP/Panel show')).toBe(true)
  })

  test('rejects unrelated keys', () => {
    expect(isGsapSheetObjectKey('Main / hero')).toBe(false)
  })

  test('respects configured namespace', () => {
    setConfiguredGsapSheetObjectNamespace('Tween')
    expect(isGsapSheetObjectKey('Tween / intro')).toBe(true)
    expect(isGsapSheetObjectKey('GSAP / intro')).toBe(false)
  })
})
