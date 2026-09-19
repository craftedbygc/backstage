import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import {getAnimationEntryForSheetObject} from '@unseenco/theatre-shared/gsap/gsapAnimationRegistry'
import {
  isGsapScrollTriggerSheetObjectKey,
  isGsapSheetObjectKey,
} from '@unseenco/theatre-shared/gsap/gsapSheetObjectKey'
import React from 'react'
import styled from 'styled-components'

export type GsapKindBadgeKind = 'TW' | 'TL' | 'ST'

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  height: 14px;
  width: 16px;
  box-sizing: border-box;
  border: 1px solid #6a6a6a;
  border-radius: 3px;
  font-size: 8px;
  font-weight: 600;
  color: #a8a8a8;
  line-height: 1;
  letter-spacing: 0.02em;
  font-family: monospace;
`

const LabelRow = styled.span`
  display: inline-flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  gap: 4px;

  & > :last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
`

export const GsapKindBadge: React.VFC<{kind: GsapKindBadgeKind}> = ({kind}) => (
  <Badge title={gsapKindBadgeTitle(kind)}>{kind}</Badge>
)

function gsapKindBadgeTitle(kind: GsapKindBadgeKind): string {
  switch (kind) {
    case 'TW':
      return 'GSAP tween'
    case 'TL':
      return 'GSAP timeline'
    case 'ST':
      return 'GSAP ScrollTrigger'
  }
}

export function gsapKindBadgeForSheetObject(
  sheetObject: SheetObject,
): GsapKindBadgeKind | null {
  const objectKey = sheetObject.address.objectKey
  if (!isGsapSheetObjectKey(objectKey)) {
    return null
  }
  if (isGsapScrollTriggerSheetObjectKey(objectKey)) {
    return 'ST'
  }
  const entry = getAnimationEntryForSheetObject(sheetObject)
  if (entry?.kind === 'timeline') {
    return 'TL'
  }
  return 'TW'
}

export function gsapKindBadgeForClipHasTimelineChildren(
  hasTimelineChildren: boolean,
): GsapKindBadgeKind {
  return hasTimelineChildren ? 'TL' : 'TW'
}

export function renderGsapListLabel(
  kind: GsapKindBadgeKind | null,
  text: React.ReactNode,
): React.ReactNode {
  if (!kind) return text
  return (
    <LabelRow>
      <GsapKindBadge kind={kind} />
      <span>{text}</span>
    </LabelRow>
  )
}
