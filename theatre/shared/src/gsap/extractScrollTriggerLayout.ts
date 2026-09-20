import type {GsapTimelineChildClip} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import {
  introspectGsapTimelineChildren,
  isGsapTimeline,
} from './introspectGsapTimelineChildren'
import type {GsapScrollTriggerSurface} from './scrollTriggerGuards'
import {
  defaultScrollTriggerLabel,
  readAnimationSpanSeconds,
  resolveScrollTriggerAnimation,
} from './scrollTriggerGuards'
import {
  defaultPageScrollContext,
  isPageScrollTrigger,
  resolvePageScrollAxis,
} from '@unseenco/backstage-shared/sheets/pageScrollContext'
import type {PageScrollContext} from '@unseenco/backstage-shared/sheets/pageScrollContext'
import {
  getMaxScrollForPageScrollContext,
  scrollPixelsToPageUnits,
} from './scrollTriggerLayout'
import {resolveMaxScrollPxForPageLayout} from '@unseenco/backstage-shared/sheets/remotePageScrollMetrics'

export type {
  PageScrollContext,
  PageScrollScroller,
} from '@unseenco/backstage-shared/sheets/pageScrollContext'
export {
  defaultPageScrollContext,
  isPageScrollTrigger,
  isVerticalPageScrollTrigger,
  pageScrollScrollersMatch,
  resolvePageScrollScroller,
} from '@unseenco/backstage-shared/sheets/pageScrollContext'

export type ExtractedScrollTriggerLayout = {
  id: string
  label: string
  layout: {start: number; duration: number}
  kind: 'tween' | 'timeline'
  animationSpanSeconds: number
  timelineChildren: GsapTimelineChildClip[]
}

export type ExtractScrollTriggerLayoutOptions = {
  sequenceLength: number
  /** Stable id override from registration. */
  id?: string
  label?: string
  fallbackIndex?: number
  pageScrollContext?: PageScrollContext
}

export type ExtractScrollTriggerLayoutResult =
  | {ok: true; value: ExtractedScrollTriggerLayout}
  | {ok: false; reason: 'unsupported_scroller' | 'missing_animation'}

/**
 * Reads resolved ST start/end and maps to sequence units for page-mode visualization.
 */
export function extractScrollTriggerLayout(
  st: unknown,
  options: ExtractScrollTriggerLayoutOptions,
): ExtractScrollTriggerLayoutResult {
  const pageScrollContext =
    options.pageScrollContext ?? defaultPageScrollContext
  if (!isPageScrollTrigger(st, pageScrollContext)) {
    return {ok: false, reason: 'unsupported_scroller'}
  }

  const surface = st as GsapScrollTriggerSurface
  const animation = resolveScrollTriggerAnimation(st)
  if (!animation) {
    return {ok: false, reason: 'missing_animation'}
  }

  const axis = resolvePageScrollAxis(pageScrollContext)
  const localMaxScroll = getMaxScrollForPageScrollContext(
    pageScrollContext.scroller,
    axis,
  )
  const maxScroll = resolveMaxScrollPxForPageLayout(localMaxScroll, axis)
  const layout = scrollPixelsToPageUnits(
    surface.start,
    surface.end,
    maxScroll,
    options.sequenceLength,
  )

  const fallbackIndex = options.fallbackIndex ?? 0
  const label = options.label ?? defaultScrollTriggerLabel(st, fallbackIndex)
  const id =
    options.id ??
    (typeof surface.vars?.id === 'string' && surface.vars.id.length > 0
      ? surface.vars.id
      : `st_${label.replace(/\s+/g, '_')}_${fallbackIndex}`)

  const kind = isGsapTimeline(animation) ? 'timeline' : 'tween'
  const animationSpanSeconds = readAnimationSpanSeconds(animation)
  const timelineChildren =
    kind === 'timeline' ? introspectGsapTimelineChildren(animation) : []

  return {
    ok: true,
    value: {
      id,
      label,
      layout,
      kind,
      animationSpanSeconds,
      timelineChildren,
    },
  }
}

/** Maps timeline child local times into sequence space inside a scroll-trigger span. */
export function scrollTriggerChildInSequenceSpace(
  parentStart: number,
  parentDuration: number,
  animationSpanSeconds: number,
  child: Pick<GsapTimelineChildClip, 'localStart' | 'localDuration'>,
): {start: number; duration: number} {
  const span = Math.max(animationSpanSeconds, 0.01)
  const start = parentStart + (child.localStart / span) * parentDuration
  const duration = Math.max((child.localDuration / span) * parentDuration, 0.01)
  return {start, duration}
}

/** Single tween child: spans the full scroll-trigger bar (scrub maps 0–1). */
export function scrollTriggerTweenChildInSequenceSpace(
  parentStart: number,
  parentDuration: number,
  tweenDurationSeconds: number,
): {start: number; duration: number} {
  void tweenDurationSeconds
  return {start: parentStart, duration: parentDuration}
}
