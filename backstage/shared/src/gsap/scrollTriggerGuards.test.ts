import {
  resolveScrollTriggerAnimation,
  isDocumentVerticalScrollTrigger,
} from './scrollTriggerGuards'

describe('scrollTriggerGuards', () => {
  test('isDocumentVerticalScrollTrigger accepts default scroller', () => {
    expect(
      isDocumentVerticalScrollTrigger({
        start: 0,
        end: 100,
        horizontal: false,
      }),
    ).toBe(true)
  })

  test('isDocumentVerticalScrollTrigger rejects horizontal', () => {
    expect(
      isDocumentVerticalScrollTrigger({
        start: 0,
        end: 100,
        horizontal: true,
      }),
    ).toBe(false)
  })

  test('resolveScrollTriggerAnimation reads animation and vars', () => {
    const tween = {pause: () => {}}
    expect(
      resolveScrollTriggerAnimation({start: 0, end: 1, animation: tween}),
    ).toBe(tween)
    expect(
      resolveScrollTriggerAnimation({
        start: 0,
        end: 1,
        vars: {animation: tween},
      }),
    ).toBe(tween)
  })
})
