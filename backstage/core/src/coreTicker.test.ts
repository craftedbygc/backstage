/*
 * @jest-environment jsdom
 */
import {
  getCoreTicker,
  resetCoreRafDriverForTests,
} from '@unseenco/backstage/coreTicker'

describe('createBasicRafDriver (via getCoreTicker)', () => {
  const originalRaf = globalThis.requestAnimationFrame
  const originalCancel = globalThis.cancelAnimationFrame

  beforeEach(() => {
    resetCoreRafDriverForTests()
  })

  afterEach(() => {
    resetCoreRafDriverForTests()
    globalThis.requestAnimationFrame = originalRaf
    globalThis.cancelAnimationFrame = originalCancel
  })

  test('does not leak pending rAF callbacks after repeated dormant cycles', () => {
    const pending = new Map<number, FrameRequestCallback>()
    let nextId = 1

    globalThis.requestAnimationFrame = (cb) => {
      const id = nextId++
      pending.set(id, cb)
      return id
    }
    globalThis.cancelAnimationFrame = (id) => {
      pending.delete(id)
    }

    const flushOneFrame = (time: number) => {
      const first = pending.entries().next().value as
        | [number, FrameRequestCallback]
        | undefined
      if (!first) return
      pending.delete(first[0])
      first[1](time)
    }

    const ticker = getCoreTicker()

    for (let cycle = 0; cycle < 5; cycle++) {
      ticker.onThisOrNextTick(() => {})
      for (let frame = 0; frame < 200; frame++) {
        flushOneFrame(frame)
      }
    }

    expect(pending.size).toBe(0)
  })
})
