import {extractScrollTriggerLayout} from './extractScrollTriggerLayout'
import {defaultPageScrollContext} from '@unseenco/theatre-shared/sheets/pageScrollContext'
import type {PageScrollContext} from '@unseenco/theatre-shared/sheets/pageScrollContext'
import {refreshGsapScrollTriggersFromGlobal} from './scrollTriggerGlobal'
import {
  listScrollTriggerEntriesForSheet,
  updateScrollTriggerLayoutInRegistry,
} from './scrollTriggerRegistry'

/** Re-measures all registered ScrollTriggers on a sheet (after ST refresh / resize). */
export function refreshScrollTriggerLayoutsForSheet(
  sheetKey: string,
  sequenceLength: number,
  pageScrollContext: PageScrollContext = defaultPageScrollContext,
): void {
  refreshGsapScrollTriggersFromGlobal()

  for (const entry of listScrollTriggerEntriesForSheet(sheetKey)) {
    const extracted = extractScrollTriggerLayout(entry.scrollTrigger, {
      sequenceLength,
      id: entry.id,
      label: entry.label,
      pageScrollContext,
    })
    if (!extracted.ok) continue
    updateScrollTriggerLayoutInRegistry(sheetKey, entry.id, {
      layout: extracted.value.layout,
      kind: extracted.value.kind,
      animationSpanSeconds: extracted.value.animationSpanSeconds,
      timelineChildren: extracted.value.timelineChildren,
    })
  }
}
