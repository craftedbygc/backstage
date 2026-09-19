/*
 * @jest-environment jsdom
 */
import {
  introspectGsapAnimationDetails,
  readGsapTargets,
  readGsapTweenVars,
  readGsapObjectPreviewEntries,
} from './introspectGsapTweenDetails'

describe('introspectGsapTweenDetails', () => {
  test('readGsapTargets maps elements and objects', () => {
    const el = document.createElement('div')
    el.id = 'box'
    const tween = {
      targets: () => [el, {x: 1, vars: {id: 'proxy'}}],
    }
    const targets = readGsapTargets(tween)
    expect(targets).toHaveLength(2)
    expect(targets[0]).toMatchObject({
      kind: 'element',
      label: '#box',
    })
    expect(targets[1]).toMatchObject({
      kind: 'object',
      label: 'proxy',
    })
  })

  test('readGsapTweenVars skips callbacks and scrollTrigger', () => {
    const tween = {
      vars: {
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {},
        onComplete: () => {},
      },
    }
    expect(readGsapTweenVars(tween)).toEqual([
      {key: 'duration', displayValue: '1'},
      {key: 'ease', displayValue: 'power2.out'},
    ])
  })

  test('introspectGsapAnimationDetails expands timeline children', () => {
    const child = {
      vars: {id: 'child-a', duration: 0.5},
      targets: () => [],
      startTime: () => 0,
      duration: () => 0.5,
    }
    const timeline = {
      getChildren: () => [child],
      duration: () => 1,
    }
    const details = introspectGsapAnimationDetails(timeline)
    expect(details.kind).toBe('timeline')
    expect(details.blocks).toHaveLength(1)
    expect(details.blocks[0]?.name).toBe('child-a')
    expect(details.blocks[0]?.vars).toEqual([
      {key: 'duration', displayValue: '0.5'},
      {key: 'id', displayValue: 'child-a'},
    ])
  })

  test('readGsapObjectPreviewEntries lists top-level keys', () => {
    expect(readGsapObjectPreviewEntries({a: 1, b: 'two'})).toEqual([
      {key: 'a', displayValue: '1'},
      {key: 'b', displayValue: 'two'},
    ])
  })
})
