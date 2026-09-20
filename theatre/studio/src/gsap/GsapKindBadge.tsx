import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import {getAnimationEntryForSheetObject} from '@unseenco/backstage-shared/gsap/gsapAnimationRegistry'
import {
  isGsapScrollTriggerSheetObjectKey,
  isGsapSheetObjectKey,
} from '@unseenco/backstage-shared/gsap/gsapSheetObjectKey'
import React from 'react'
import styled from 'styled-components'

export type GsapKindBadgeKind = 'TW' | 'TL' | 'ST'

const BADGE_WIDTH = 16
const BADGE_HEIGHT = 14

const BadgeSvg = styled.svg`
  flex: 0 0 auto;
  display: block;

  /* Global studio reset sets * { font: inherit }, which wins over SVG attrs. */
  text {
    fill: #a8a8a8;
    font-size: 8px;
    font-weight: 600;
    font-family: monospace;
    letter-spacing: 0.02em;
  }

  rect {
    stroke: #6a6a6a;
  }

  [data-header].selected & text {
    fill: rgba(255, 255, 255, 0.9);
  }

  [data-header].selected & rect {
    stroke: rgba(255, 255, 255, 0.55);
  }
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
  <BadgeSvg
    width={BADGE_WIDTH}
    height={BADGE_HEIGHT}
    viewBox={`0 0 ${BADGE_WIDTH} ${BADGE_HEIGHT}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label={gsapKindBadgeTitle(kind)}
  >
    <title>{gsapKindBadgeTitle(kind)}</title>
    <rect
      x="0.5"
      y="0.5"
      width={BADGE_WIDTH - 1}
      height={BADGE_HEIGHT - 1}
      rx="3"
      strokeWidth="1"
    />
    <text
      x={BADGE_WIDTH / 2}
      y={BADGE_HEIGHT / 2}
      textAnchor="middle"
      dominantBaseline="central"
    >
      {kind}
    </text>
  </BadgeSvg>
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
