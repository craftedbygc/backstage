/*
 * @jest-environment jsdom
 */
import {
  encodeDomElementHighlightTarget,
  labelDomElementForHighlight,
  resolveDomElementHighlightTarget,
} from './domElementHighlightTarget'

describe('domElementHighlightTarget', () => {
  it('labels elements with id', () => {
    const el = document.createElement('div')
    el.id = 'hero-box'
    expect(labelDomElementForHighlight(el)).toBe('#hero-box')
  })

  it('encodes and resolves by id', () => {
    const el = document.createElement('div')
    el.id = 'hero-box'
    document.body.appendChild(el)

    const encoded = encodeDomElementHighlightTarget(el)
    expect(encoded).toEqual({
      type: 'id',
      id: 'hero-box',
      label: '#hero-box',
    })
    expect(resolveDomElementHighlightTarget(encoded!)).toBe(el)

    document.body.removeChild(el)
  })

  it('encodes tag.class selector when no id', () => {
    const el = document.createElement('div')
    el.className = 'card primary'
    document.body.appendChild(el)

    const encoded = encodeDomElementHighlightTarget(el)
    expect(encoded).toEqual({
      type: 'selector',
      selector: 'div.card',
      label: 'div.card',
    })
    expect(resolveDomElementHighlightTarget(encoded!)).toBe(el)

    document.body.removeChild(el)
  })
})
