/*
 * @jest-environment jsdom
 */
import {getProject} from '@unseenco/backstage'
import {privateAPI} from '@unseenco/backstage/privateAPIs'
import globals from '@unseenco/backstage-shared/globals'
import {
  clearAnimationRegistryForTests,
  getAnimationEntry,
  listAnimationEntries,
} from '@unseenco/backstage-shared/gsap/gsapAnimationRegistry'
import {clearGsapObjectBindingsForTests} from '@unseenco/backstage-shared/gsap/gsapObjectBinding'
import {registerGsapAnimation} from './registerGsapAnimation'
import {unregisterGsapAnimation} from './unregisterGsapAnimation'

describe('GSAP registry lifecycle', () => {
  beforeEach(() => {
    clearAnimationRegistryForTests()
    clearGsapObjectBindingsForTests()
  })

  test('sheet.unload clears registry entries and re-register works', async () => {
    const project = getProject('gsap-unload', {
      state: {
        sheetsById: {},
        definitionVersion: globals.currentProjectStateDefinitionVersion,
        revisionHistory: [],
      },
    })
    await project.ready

    const sheet = project.sheet('Scene')
    const tween = {pause: jest.fn(), duration: () => 1}
    registerGsapAnimation(tween as never, sheet, {label: 'Box'})
    expect(listAnimationEntries()).toHaveLength(1)

    privateAPI(sheet).unload()
    expect(listAnimationEntries()).toHaveLength(0)

    registerGsapAnimation(tween as never, sheet, {label: 'Box'})
    const sheetInternal = privateAPI(sheet)
    const obj = sheetInternal.getObjects()[0]
    expect(getAnimationEntry(obj!)).toBeDefined()
  })

  test('unregisterGsapAnimation removes a single entry', async () => {
    const project = getProject('gsap-unregister', {
      state: {
        sheetsById: {},
        definitionVersion: globals.currentProjectStateDefinitionVersion,
        revisionHistory: [],
      },
    })
    await project.ready

    const sheet = project.sheet('Scene')
    const tween = {pause: jest.fn(), duration: () => 1}
    const {id} = registerGsapAnimation(tween as never, sheet, {label: 'Box'})
    expect(listAnimationEntries()).toHaveLength(1)

    unregisterGsapAnimation(sheet, {id})
    expect(listAnimationEntries()).toHaveLength(0)
  })
})
