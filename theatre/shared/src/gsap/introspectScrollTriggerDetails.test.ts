/*
 * @jest-environment jsdom
 */
import {introspectScrollTriggerDetails} from './introspectScrollTriggerDetails'
import type {GsapScrollTriggerRegistryEntry} from './scrollTriggerRegistry'

describe('introspectScrollTriggerDetails', () => {
  test('reads trigger element and vars', () => {
    const triggerEl = document.createElement('section')
    triggerEl.id = 'hero'
    const tween = {
      vars: {duration: 2},
      targets: () => [triggerEl],
      duration: () => 2,
    }
    const st = {
      trigger: triggerEl,
      start: 0,
      end: 500,
      vars: {scrub: true, animation: tween},
    }
    const entry: GsapScrollTriggerRegistryEntry = {
      id: 'st_1',
      label: 'Hero ST',
      scrollTrigger: st,
      layout: {start: 0, duration: 10},
      kind: 'tween',
      animationSpanSeconds: 2,
      timelineChildren: [],
    }
    const details = introspectScrollTriggerDetails(entry)
    expect(details.label).toBe('Hero ST')
    expect(details.triggerTargets[0]).toMatchObject({
      kind: 'element',
      label: '#hero',
    })
    expect(details.vars.some((row) => row.key === 'scrub')).toBe(true)
    expect(details.linkedAnimationBlocks).toHaveLength(1)
    expect(details.linkedAnimationBlocks[0]?.vars).toEqual([
      {key: 'duration', displayValue: '2'},
    ])
  })
})
