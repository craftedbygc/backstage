/*
 * @jest-environment jsdom
 */
import {createElementHorizontalScrollDriver} from './attachSheetScrollDriver'

describe('createElementHorizontalScrollDriver', () => {
  test('maps scrollLeft to progress', () => {
    const el = document.createElement('div')
    Object.defineProperty(el, 'scrollWidth', {value: 1000, configurable: true})
    Object.defineProperty(el, 'clientWidth', {value: 200, configurable: true})
    Object.defineProperty(el, 'scrollLeft', {
      value: 400,
      writable: true,
      configurable: true,
    })

    const driver = createElementHorizontalScrollDriver(el)
    expect(driver.getProgress()).toBeCloseTo(0.5, 5)

    driver.setProgress(1)
    expect(el.scrollLeft).toBe(800)
  })
})
