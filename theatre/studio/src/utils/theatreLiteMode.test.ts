import {
  isTheatreLiteStudio,
  isTheatreLiteStudioLocked,
  setRuntimeStudioMode,
} from '@unseenco/theatre-studio/utils/theatreLiteMode'

describe('theatreLiteMode', () => {
  const forceLiteKey = '__THEATRE_FORCE_LITE__' as const

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
    expect(isTheatreLiteStudio()).toBe(false)
    setRuntimeStudioMode('lite')
    expect(isTheatreLiteStudio()).toBe(true)
    setRuntimeStudioMode('full')
    expect(isTheatreLiteStudio()).toBe(false)
  })

  test('__THEATRE_FORCE_LITE__ locks lite studio (studio-lite source entry)', () => {
    ;(
      globalThis as typeof globalThis & {[forceLiteKey]?: boolean}
    ).__THEATRE_FORCE_LITE__ = true
    expect(isTheatreLiteStudioLocked()).toBe(true)
    expect(isTheatreLiteStudio()).toBe(true)
    setRuntimeStudioMode('full')
    expect(isTheatreLiteStudio()).toBe(true)
  })

  test('compile-time __THEATRE_LITE__ locks lite when THEATRE_LITE_TEST=1', () => {
    if (process.env.THEATRE_LITE_TEST !== '1') {
      return
    }
    expect(isTheatreLiteStudioLocked()).toBe(true)
    expect(isTheatreLiteStudio()).toBe(true)
  })
})
