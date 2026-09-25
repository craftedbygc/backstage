/*
 * @jest-environment jsdom
 */
import {createLenisScrollDriver} from './lenis'

describe('createLenisScrollDriver', () => {
  test('maps scroll position to 0–1 progress', async () => {
    const listeners: Array<() => void> = []
    const lenis = {
      scroll: 250,
      limit: 1000,
      scrollTo(target: number) {
        this.scroll = target
        listeners.forEach((l) => l())
      },
      on(_event: 'scroll', handler: () => void) {
        listeners.push(handler)
      },
      off(_event: 'scroll', handler: () => void) {
        const i = listeners.indexOf(handler)
        if (i >= 0) listeners.splice(i, 1)
      },
    }

    const driver = createLenisScrollDriver(lenis)
    expect(driver.getProgress()).toBe(0.25)

    driver.setProgress(0.5)
    expect(lenis.scroll).toBe(500)

    let echoCount = 0
    const echoUnsub = driver.subscribe(() => {
      echoCount++
    })
    driver.setProgress(0.5)
    listeners.forEach((l) => l())
    expect(echoCount).toBe(0)
    echoUnsub()
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })

    let last = -1
    const unsub = driver.subscribe((p) => {
      last = p
    })
    lenis.scroll = 100
    listeners[0]?.()
    expect(last).toBe(0.1)
    unsub()
  })
})
