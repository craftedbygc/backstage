/*
 * @jest-environment jsdom
 */
import {
  attachSheetScrollDriver,
  createElementHorizontalScrollDriver,
  getSheetScrollDriver,
} from './attachSheetScrollDriver'
import {getProject} from '@unseenco/backstage'
import {getCoreTicker} from '@unseenco/backstage/coreTicker'
import globals from '@unseenco/backstage-shared/globals'

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

  const testUnlessLite =
    process.env.BACKSTAGE_LITE_TEST === '1' ? test.skip : test

  testUnlessLite('disposer clears WeakMap entry when driver matches', async () => {
    const project = getProject('scroll-driver-dispose', {
      state: {
        sheetsById: {},
        definitionVersion: globals.currentProjectStateDefinitionVersion,
        revisionHistory: [],
      },
    })
    getCoreTicker().tick()
    await project.ready
    const sheet = project.sheet('Scene')
    sheet.setSequenceMode('page')
    const driver = createElementHorizontalScrollDriver(document.createElement('div'))
    const dispose = attachSheetScrollDriver(sheet, driver)
    expect(getSheetScrollDriver(sheet)).toBe(driver)
    dispose()
    expect(getSheetScrollDriver(sheet)).toBeUndefined()
  })
})
