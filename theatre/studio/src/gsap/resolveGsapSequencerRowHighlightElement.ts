import {getAnimationEntryForSheetObject} from '@unseenco/backstage-shared/gsap/gsapAnimationRegistry'
import {
  isGsapScrollTriggerSheetObjectKey,
  isGsapSheetObjectKey,
} from '@unseenco/backstage-shared/gsap/gsapSheetObjectKey'
import {
  getScrollTriggerEntryForSheetObject,
  introspectScrollTriggerDetails,
} from '@unseenco/backstage-shared/gsap/introspectScrollTriggerDetails'
import {readGsapTargets} from '@unseenco/backstage-shared/gsap/introspectGsapTweenDetails'
import type {GsapTargetDescriptor} from '@unseenco/backstage-shared/gsap/introspectGsapTweenDetails'
import {linkGsapTimelineChildAnimations} from '@unseenco/backstage-shared/gsap/introspectGsapTimelineChildren'
import {resolveScrollTriggerAnimation} from '@unseenco/backstage-shared/gsap/scrollTriggerGuards'
import type {SequenceEditorTree_AllRowTypes} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'

function firstConnectedElementTarget(
  targets: GsapTargetDescriptor[],
): Element | null {
  for (const target of targets) {
    if (target.kind === 'element' && target.element.isConnected) {
      return target.element
    }
  }
  return null
}

/** First DOM target for GSAP sequencer left-row hover highlight, if any. */
export function resolveGsapSequencerRowHighlightElement(
  leaf: SequenceEditorTree_AllRowTypes,
): Element | null {
  switch (leaf.type) {
    case 'sheetObject': {
      if (
        leaf.gsapScrollTrigger ||
        isGsapScrollTriggerSheetObjectKey(leaf.sheetObject.address.objectKey)
      ) {
        const entry = getScrollTriggerEntryForSheetObject(leaf.sheetObject)
        if (!entry) return null
        const {triggerTargets} = introspectScrollTriggerDetails(entry)
        return firstConnectedElementTarget(triggerTargets)
      }
      if (
        leaf.gsapClip ||
        isGsapSheetObjectKey(leaf.sheetObject.address.objectKey)
      ) {
        const entry = getAnimationEntryForSheetObject(leaf.sheetObject)
        if (!entry?.animation) return null
        return firstConnectedElementTarget(readGsapTargets(entry.animation))
      }
      return null
    }
    case 'gsapClipTrack': {
      const entry = getAnimationEntryForSheetObject(leaf.sheetObject)
      if (!entry?.animation) return null
      return firstConnectedElementTarget(readGsapTargets(entry.animation))
    }
    case 'gsapChildClip': {
      const entry = getAnimationEntryForSheetObject(leaf.sheetObject)
      const childAnimation = entry?.timelineChildById?.get(leaf.childId)
      if (!childAnimation) return null
      return firstConnectedElementTarget(readGsapTargets(childAnimation))
    }
    case 'gsapScrollTriggerTrack': {
      const entry = getScrollTriggerEntryForSheetObject(leaf.sheetObject)
      if (!entry) return null
      const {triggerTargets} = introspectScrollTriggerDetails(entry)
      return firstConnectedElementTarget(triggerTargets)
    }
    case 'gsapScrollTriggerChild': {
      const entry = getScrollTriggerEntryForSheetObject(leaf.sheetObject)
      if (!entry) return null
      const animation = resolveScrollTriggerAnimation(entry.scrollTrigger)
      if (!animation) return null
      const childAnimation = linkGsapTimelineChildAnimations(animation).get(
        leaf.childId,
      )
      if (!childAnimation) return null
      return firstConnectedElementTarget(readGsapTargets(childAnimation))
    }
    default:
      return null
  }
}

function isGsapSequencerHighlightRow(
  leaf: SequenceEditorTree_AllRowTypes,
): boolean {
  if (leaf.type === 'sheetObject') {
    return (
      !!leaf.gsapClip ||
      !!leaf.gsapScrollTrigger ||
      isGsapSheetObjectKey(leaf.sheetObject.address.objectKey)
    )
  }
  return (
    leaf.type === 'gsapClipTrack' ||
    leaf.type === 'gsapChildClip' ||
    leaf.type === 'gsapScrollTriggerTrack' ||
    leaf.type === 'gsapScrollTriggerChild'
  )
}

export {isGsapSequencerHighlightRow}
