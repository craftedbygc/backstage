import {
  resolveGsapAnimationRegistrationLabel,
  resolveGsapTimelineChildSequencerLabel,
} from './gsapAnimationLabel'
import {
  introspectGsapTimelineChildren,
  isGsapTimeline,
  linkGsapTimelineChildAnimations,
} from './introspectGsapTimelineChildren'

export type GsapVarDisplayRow = {
  key: string
  displayValue: string
}

export type GsapTargetDescriptor =
  | {kind: 'element'; element: Element; label: string}
  | {kind: 'object'; value: unknown; label: string}

export type GsapTweenDetailsBlock = {
  name: string
  targets: GsapTargetDescriptor[]
  vars: GsapVarDisplayRow[]
}

const TWEEN_VARS_SKIP_KEYS = new Set([
  'scrollTrigger',
  'animation',
  'onComplete',
  'onStart',
  'onUpdate',
  'onRepeat',
  'onReverseComplete',
  'callbackScope',
  'runBackwards',
  'startAt',
  'repeatRefresh',
])

function formatGsapVarDisplayValue(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'function') return '[Function]'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (typeof value === 'object') {
    try {
      const json = JSON.stringify(value)
      if (json.length > 120) {
        return `${json.slice(0, 117)}…`
      }
      return json
    } catch {
      return '[Object]'
    }
  }
  return String(value)
}

function labelForElement(el: Element): string {
  if (el.id) {
    return `#${el.id}`
  }
  const tag = el.tagName.toLowerCase()
  if (el instanceof HTMLElement) {
    const className = el.className
    if (typeof className === 'string' && className.trim().length > 0) {
      const firstClass = className.trim().split(/\s+/)[0]
      if (firstClass) {
        return `${tag}.${firstClass}`
      }
    }
  }
  return tag
}

function labelForObject(value: unknown): string {
  if (value && typeof value === 'object') {
    const id = (value as {vars?: {id?: string}}).vars?.id
    if (typeof id === 'string' && id.length > 0) {
      return id
    }
    const name = (value as {constructor?: {name?: string}}).constructor?.name
    if (typeof name === 'string' && name.length > 0 && name !== 'Object') {
      return name
    }
  }
  return 'Object'
}

function readGsapVarsObject(
  vars: Record<string, unknown>,
  skipKeys: Set<string>,
): GsapVarDisplayRow[] {
  const rows: GsapVarDisplayRow[] = []
  for (const key of Object.keys(vars).sort()) {
    if (skipKeys.has(key)) continue
    rows.push({
      key,
      displayValue: formatGsapVarDisplayValue(vars[key]),
    })
  }
  return rows
}

/** Reads GSAP tween `targets()` when available. */
export function readGsapTargets(animation: unknown): GsapTargetDescriptor[] {
  const tween = animation as {targets?: () => unknown[]}
  if (typeof tween.targets !== 'function') {
    return []
  }
  const raw = tween.targets()
  if (!Array.isArray(raw)) {
    return []
  }
  return raw.map((item) => {
    if (typeof Element !== 'undefined' && item instanceof Element) {
      return {
        kind: 'element' as const,
        element: item,
        label: labelForElement(item),
      }
    }
    return {
      kind: 'object' as const,
      value: item,
      label: labelForObject(item),
    }
  })
}

/** Sorted read-only rows from tween `vars`. */
export function readGsapTweenVars(animation: unknown): GsapVarDisplayRow[] {
  const vars = (animation as {vars?: Record<string, unknown>}).vars
  if (!vars || typeof vars !== 'object') {
    return []
  }
  return readGsapVarsObject(vars, TWEEN_VARS_SKIP_KEYS)
}

export function introspectGsapAnimationDetails(
  animation: unknown,
  options?: {registrationLabel?: string},
): {kind: 'tween' | 'timeline'; blocks: GsapTweenDetailsBlock[]} {
  if (isGsapTimeline(animation)) {
    const children = introspectGsapTimelineChildren(animation)
    const childMap = linkGsapTimelineChildAnimations(animation)
    const blocks = children.map((childData) => {
      const childAnim = childMap.get(childData.childId)
      return {
        name: resolveGsapTimelineChildSequencerLabel(animation, childData),
        targets: childAnim ? readGsapTargets(childAnim) : [],
        vars: childAnim ? readGsapTweenVars(childAnim) : [],
      }
    })
    return {kind: 'timeline', blocks}
  }

  return {
    kind: 'tween',
    blocks: [
      {
        name: resolveGsapAnimationRegistrationLabel(
          animation,
          options?.registrationLabel,
        ),
        targets: readGsapTargets(animation),
        vars: readGsapTweenVars(animation),
      },
    ],
  }
}

/** Top-level enumerable keys on a non-DOM target (depth 1). */
export function readGsapObjectPreviewEntries(
  value: unknown,
  maxEntries = 12,
): {key: string; displayValue: string}[] {
  if (!value || typeof value !== 'object') {
    return []
  }
  const entries: {key: string; displayValue: string}[] = []
  for (const key of Object.keys(value as object).sort()) {
    if (entries.length >= maxEntries) break
    entries.push({
      key,
      displayValue: formatGsapVarDisplayValue(
        (value as Record<string, unknown>)[key],
      ),
    })
  }
  return entries
}
