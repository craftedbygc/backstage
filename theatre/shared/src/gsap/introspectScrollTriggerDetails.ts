import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import {resolveScrollTriggerAnimation} from './scrollTriggerGuards'
import {introspectGsapAnimationDetails} from './introspectGsapTweenDetails'
import type {
  GsapTargetDescriptor,
  GsapTweenDetailsBlock,
  GsapVarDisplayRow,
} from './introspectGsapTweenDetails'
import {
  listScrollTriggerEntriesForSheet,
  sheetAddressKey,
} from './scrollTriggerRegistry'
import type {GsapScrollTriggerRegistryEntry} from './scrollTriggerRegistry'

const SCROLL_TRIGGER_VARS_SKIP_KEYS = new Set([
  'animation',
  'onEnter',
  'onLeave',
  'onEnterBack',
  'onLeaveBack',
  'onUpdate',
  'onToggle',
  'onRefresh',
  'onSnapComplete',
  'onScrubComplete',
])

function labelForElement(el: Element): string {
  if (el.id) {
    return `#${el.id}`
  }
  return el.tagName.toLowerCase()
}

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

function readScrollTriggerTriggerTargets(st: unknown): GsapTargetDescriptor[] {
  const trigger = (st as {trigger?: unknown}).trigger
  if (typeof Element !== 'undefined' && trigger instanceof Element) {
    return [
      {
        kind: 'element',
        element: trigger,
        label: labelForElement(trigger),
      },
    ]
  }
  if (typeof trigger === 'string') {
    if (typeof document !== 'undefined') {
      try {
        const el = document.querySelector(trigger)
        if (el) {
          return [
            {
              kind: 'element',
              element: el,
              label: trigger,
            },
          ]
        }
      } catch {
        // invalid selector
      }
    }
    return [{kind: 'object', value: trigger, label: trigger}]
  }
  if (trigger != null) {
    let label = 'trigger'
    if (typeof Window !== 'undefined' && trigger === window) {
      label = 'window'
    } else if (typeof trigger === 'object') {
      const name = (trigger as {constructor?: {name?: string}}).constructor
        ?.name
      if (typeof name === 'string' && name.length > 0) {
        label = name
      }
    }
    return [{kind: 'object', value: trigger, label}]
  }
  return []
}

function readScrollTriggerVars(st: unknown): GsapVarDisplayRow[] {
  const surface = st as {
    vars?: Record<string, unknown>
    start?: number
    end?: number
    scrub?: unknown
    pin?: unknown
  }
  const rows: GsapVarDisplayRow[] = []
  const vars = surface.vars
  if (vars && typeof vars === 'object') {
    for (const key of Object.keys(vars).sort()) {
      if (SCROLL_TRIGGER_VARS_SKIP_KEYS.has(key)) continue
      rows.push({
        key,
        displayValue: formatGsapVarDisplayValue(vars[key]),
      })
    }
  }
  const topLevelKeys: (keyof typeof surface)[] = [
    'start',
    'end',
    'scrub',
    'pin',
  ]
  for (const key of topLevelKeys) {
    const value = surface[key]
    if (value === undefined) continue
    if (rows.some((row) => row.key === key)) continue
    rows.push({
      key: String(key),
      displayValue: formatGsapVarDisplayValue(value),
    })
  }
  return rows.sort((a, b) => a.key.localeCompare(b.key))
}

export type GsapScrollTriggerDetails = {
  label: string
  triggerTargets: GsapTargetDescriptor[]
  vars: GsapVarDisplayRow[]
  linkedAnimationBlocks: GsapTweenDetailsBlock[]
}

export function getScrollTriggerEntryForSheetObject(
  sheetObject: SheetObject,
): GsapScrollTriggerRegistryEntry | undefined {
  const sheetKey = sheetAddressKey(sheetObject.address)
  return listScrollTriggerEntriesForSheet(sheetKey).find(
    (entry) =>
      entry.sheetObject?.address.objectKey === sheetObject.address.objectKey,
  )
}

export function introspectScrollTriggerDetails(
  entry: GsapScrollTriggerRegistryEntry,
): GsapScrollTriggerDetails {
  const st = entry.scrollTrigger
  const animation = resolveScrollTriggerAnimation(st)
  let linkedAnimationBlocks: GsapTweenDetailsBlock[] = []
  if (animation) {
    linkedAnimationBlocks = introspectGsapAnimationDetails(animation, {
      registrationLabel: entry.label,
    }).blocks
  }

  return {
    label: entry.label,
    triggerTargets: readScrollTriggerTriggerTargets(st),
    vars: readScrollTriggerVars(st),
    linkedAnimationBlocks,
  }
}
