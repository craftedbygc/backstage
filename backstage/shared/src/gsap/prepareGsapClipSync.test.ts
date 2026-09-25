import {
  createGsapClipSyncFrameCache,
  prepareGsapClipSyncGroups,
  syncPreparedGsapClipGroupsAtPosition,
} from './prepareGsapClipSync'
import type {GsapClipTiming} from './syncGsapClipProgress'

describe('prepareGsapClipSync / syncPreparedGsapClipGroupsAtPosition', () => {
  const SHEET_KEY = 'p|s|si|gsap'

  const g = globalThis as typeof globalThis & {
    __unseenco_backstage_gsap_animationRegistry_v1__?: {
      bySheetAddress: Map<
        string,
        Map<
          string,
          {
            id: string
            label: string
            animation: unknown
            kind?: string
            timelineChildById?: Map<string, unknown>
          }
        >
      >
    }
  }

  function setRegistry(
    entries: Record<
      string,
      {
        animation: unknown
        targets?: unknown[]
        kind?: string
        timelineChildById?: Map<string, unknown>
      }
    >,
  ) {
    const byAnim = new Map(
      Object.entries(entries).map(
        ([id, {animation, kind, timelineChildById}]) => [
          id,
          {id, label: id, animation, kind, timelineChildById},
        ],
      ),
    )
    g.__unseenco_backstage_gsap_animationRegistry_v1__ = {
      bySheetAddress: new Map([[SHEET_KEY, byAnim]]),
    }
    for (const [, {animation, targets}] of Object.entries(entries)) {
      if (targets) {
        ;(animation as {targets: () => unknown[]}).targets = () => targets
      }
    }
  }

  function clip(timing: {
    gsapAnimationId: string
    start: number
    duration: number
    timelineChildren?: Array<{
      childId: string
      localStart: number
      localDuration: number
    }>
    timelineSpan?: number
  }) {
    return {sheetObjectAddressKey: SHEET_KEY, ...timing}
  }

  test('unchanged same-target group skips progress on second frame', () => {
    const show = {progress: jest.fn()}
    const hide = {progress: jest.fn()}
    const panel = {}

    setRegistry({
      show: {animation: show, targets: [panel]},
      hide: {animation: hide, targets: [panel]},
    })

    const clips = [
      clip({gsapAnimationId: 'show', start: 0, duration: 2}),
      clip({gsapAnimationId: 'hide', start: 8, duration: 2}),
    ]
    const groups = prepareGsapClipSyncGroups(clips as GsapClipTiming[])
    const cache = createGsapClipSyncFrameCache()

    syncPreparedGsapClipGroupsAtPosition(1, groups, cache)
    show.progress.mockClear()
    hide.progress.mockClear()

    syncPreparedGsapClipGroupsAtPosition(1, groups, cache)

    expect(show.progress).not.toHaveBeenCalled()
    expect(hide.progress).not.toHaveBeenCalled()
  })

  test('seeking to a different position still updates progress', () => {
    const tween = {progress: jest.fn()}
    setRegistry({move: {animation: tween}})

    const clips = [clip({gsapAnimationId: 'move', start: 0, duration: 2})]
    const groups = prepareGsapClipSyncGroups(clips as GsapClipTiming[])
    const cache = createGsapClipSyncFrameCache()

    syncPreparedGsapClipGroupsAtPosition(0.5, groups, cache)
    tween.progress.mockClear()
    syncPreparedGsapClipGroupsAtPosition(1.5, groups, cache)

    expect(tween.progress).toHaveBeenCalledWith(0.75, true)
  })

  test('timeline child timing is not re-applied when unchanged', () => {
    const timeline = {
      time: jest.fn(),
      totalDuration: () => 2,
      duration: () => 2,
    }
    const childTween = {
      startTime: jest.fn(),
      duration: jest.fn(),
    }
    const childById = new Map([['c1', childTween]])

    setRegistry({
      tl: {
        animation: timeline,
        kind: 'timeline',
        timelineChildById: childById,
      },
    })

    const clips = [
      clip({
        gsapAnimationId: 'tl',
        start: 0,
        duration: 2,
        timelineChildren: [{childId: 'c1', localStart: 0, localDuration: 1}],
        timelineSpan: 2,
      }),
    ]
    const groups = prepareGsapClipSyncGroups(clips as GsapClipTiming[])
    const cache = createGsapClipSyncFrameCache()

    syncPreparedGsapClipGroupsAtPosition(0.25, groups, cache)
    childTween.startTime.mockClear()
    childTween.duration.mockClear()
    syncPreparedGsapClipGroupsAtPosition(0.5, groups, cache)

    expect(childTween.startTime).not.toHaveBeenCalled()
    expect(childTween.duration).not.toHaveBeenCalled()
  })

  test('micro-benchmark: cached sync avoids progress calls between identical positions', () => {
    const tweens = Object.fromEntries(
      Array.from({length: 100}, (_, i) => {
        const animation = {progress: jest.fn()}
        return [`t${i}`, {animation, targets: [`target-${i}`]}]
      }),
    )
    setRegistry(tweens)

    const clips = Array.from({length: 100}, (_, i) =>
      clip({gsapAnimationId: `t${i}`, start: i * 0.01, duration: 0.5}),
    )
    const groups = prepareGsapClipSyncGroups(clips as GsapClipTiming[])
    const cache = createGsapClipSyncFrameCache()

    syncPreparedGsapClipGroupsAtPosition(2, groups, cache)

    let progressCalls = 0
    for (const entry of Object.values(tweens)) {
      const animation = entry.animation as {progress: jest.Mock}
      progressCalls += animation.progress.mock.calls.length
      animation.progress.mockClear()
    }

    const iterations = 1000
    const start = performance.now()
    for (let i = 0; i < iterations; i++) {
      syncPreparedGsapClipGroupsAtPosition(2, groups, cache)
    }
    const elapsedMs = performance.now() - start

    for (const entry of Object.values(tweens)) {
      const animation = entry.animation as {progress: jest.Mock}
      expect(animation.progress).not.toHaveBeenCalled()
    }

    expect(progressCalls).toBeGreaterThan(0)
    expect(elapsedMs).toBeLessThan(500)
  })
})
