import {buildGsapSheetObjectKey} from './buildGsapSheetObjectKey'
import {
  isGsapSheetObjectKey,
  setConfiguredGsapSheetObjectNamespace,
} from './gsapSheetObjectKey'

describe('buildGsapSheetObjectKey', () => {
  test('matches sheet.object sanitisation', () => {
    expect(buildGsapSheetObjectKey('GSAP', 'Panel show')).toBe(
      'GSAP / Panel show',
    )
    expect(buildGsapSheetObjectKey('GSAP', 'Panel / nested')).toBe(
      'GSAP / Panel / nested',
    )
  })
})

describe('isGsapSheetObjectKey', () => {
  afterEach(() => {
    setConfiguredGsapSheetObjectNamespace('GSAP')
  })

  test('matches Backstage-sanitised slashed keys', () => {
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
