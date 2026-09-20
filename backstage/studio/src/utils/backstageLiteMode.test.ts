import {
  isBackstageLiteStudio,
  isBackstageLiteStudioLocked,
  setRuntimeStudioMode,
} from '@unseenco/backstage/studio/utils/backstageLiteMode'

describe('backstageLiteMode', () => {
  const forceLiteKey = '__BACKSTAGE_FORCE_LITE__' as const

  beforeEach(() => {
    setRuntimeStudioMode(undefined)
    delete (globalThis as typeof globalThis & {[forceLiteKey]?: boolean})[
      forceLiteKey
    ]
  })

  afterEach(() => {
    setRuntimeStudioMode(undefined)
    delete (globalThis as typeof globalThis & {[forceLiteKey]?: boolean})[
      forceLiteKey
    ]
  })

  test('runtime mode lite gates sequencing UI helpers', () => {
    expect(isBackstageLiteStudio()).toBe(false)
    setRuntimeStudioMode('lite')
    expect(isBackstageLiteStudio()).toBe(true)
    setRuntimeStudioMode('full')
    expect(isBackstageLiteStudio()).toBe(false)
  })

  test('__BACKSTAGE_FORCE_LITE__ locks lite studio (studio-lite source entry)', () => {
    ;(
      globalThis as typeof globalThis & {[forceLiteKey]?: boolean}
    ).__BACKSTAGE_FORCE_LITE__ = true
    expect(isBackstageLiteStudioLocked()).toBe(true)
    expect(isBackstageLiteStudio()).toBe(true)
    setRuntimeStudioMode('full')
    expect(isBackstageLiteStudio()).toBe(true)
  })

  test('compile-time __BACKSTAGE_LITE__ locks lite when BACKSTAGE_LITE_TEST=1', () => {
    if (process.env.BACKSTAGE_LITE_TEST !== '1') {
      return
    }
    expect(isBackstageLiteStudioLocked()).toBe(true)
    expect(isBackstageLiteStudio()).toBe(true)
  })
})
