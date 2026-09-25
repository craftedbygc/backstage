import {crossBundleSingleton} from './crossBundleSingleton'

describe('crossBundleSingleton', () => {
  afterEach(() => {
    const storeKey = '__unseenco_backstage_test_counter_v1__'
    delete (globalThis as Record<string, unknown>)[storeKey]
  })

  it('returns the same instance for the same key', () => {
    const a = crossBundleSingleton('test_counter', () => ({n: 0}))
    const b = crossBundleSingleton('test_counter', () => ({n: 99}))
    expect(a).toBe(b)
    expect(a.n).toBe(0)
  })

  it('uses a versioned globalThis key', () => {
    crossBundleSingleton('test_counter', () => ({n: 1}))
    expect(
      (globalThis as Record<string, unknown>)[
        '__unseenco_backstage_test_counter_v1__'
      ],
    ).toEqual({n: 1})
  })
})
