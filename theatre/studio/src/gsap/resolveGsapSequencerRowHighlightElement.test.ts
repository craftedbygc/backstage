/*
 * @jest-environment jsdom
 */
import type {$IntentionalAny} from '@unseenco/backstage-shared/utils/types'
import {clearAnimationRegistryForTests} from '@unseenco/backstage-shared/gsap/gsapAnimationRegistry'
import {registerAnimationInRegistry} from '@unseenco/backstage-shared/gsap/gsapAnimationRegistry'
import {clearScrollTriggerRegistryForTests} from '@unseenco/backstage-shared/gsap/scrollTriggerRegistry'
import type {SequenceEditorTree_SheetObject} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import {
  isGsapSequencerHighlightRow,
  resolveGsapSequencerRowHighlightElement,
} from './resolveGsapSequencerRowHighlightElement'

describe('resolveGsapSequencerRowHighlightElement', () => {
  afterEach(() => {
    clearAnimationRegistryForTests()
    clearScrollTriggerRegistryForTests()
  })

  test('sheetObject inline GSAP clip resolves element target', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const sheetObject = {
      address: {
        objectKey: 'GSAP / box tween',
        sheetId: 'sheet',
        projectId: 'proj',
        sheetInstanceId: 'default',
      },
    } as $IntentionalAny
    registerAnimationInRegistry({
      id: 'GSAP / box tween',
      label: 'box',
      animation: {targets: () => [el], duration: () => 1},
      sheetObject,
    })
    const leaf = {
      type: 'sheetObject',
      sheetObject,
      gsapClip: {
        trackId: 't1',
        trackData: {},
        displayLabel: 'box',
        isCollapsed: false,
      },
    } as SequenceEditorTree_SheetObject

    expect(isGsapSequencerHighlightRow(leaf)).toBe(true)
    expect(resolveGsapSequencerRowHighlightElement(leaf)).toBe(el)
  })
})
