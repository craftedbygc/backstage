import {css} from 'styled-components'

export type SequencerTrackEmphasis = 'emphasized' | 'deemphasized'

/** Explicit sequencer track colors (no CSS filter — cheaper to paint). */
export type SequencerTrackColorTokens = {
  keyframeDotNormal: string
  keyframeDotSelected: string
  keyframeDotInlineEditorOpen: string
  keyframeDotSelectedInlineEditorOpen: string
  connectorNormal: string
  connectorHover: string
  connectorSelected: string
  clipBackstageBg: string
  clipBackstageBorder: string
  clipGsapBg: string
  clipGsapBorder: string
  clipGsapTimelineBg: string
  clipGsapTimelineBorder: string
  clipGsapChildBg: string
  clipGsapChildBorder: string
  aggregateKeyframePrimary: string
  aggregateKeyframeSecondary: string
  aggregateKeyframeSelected: string
  scrollTriggerParentBg: string
  scrollTriggerParentBorder: string
  scrollTriggerChildBg: string
  scrollTriggerChildBorder: string
}

const EMPHASIZED: SequencerTrackColorTokens = {
  keyframeDotNormal: 'var(--studio-accent-soft)',
  keyframeDotSelected: '#F2C95C',
  keyframeDotInlineEditorOpen: '#FCF3DC',
  keyframeDotSelectedInlineEditorOpen: 'var(--studio-accent-soft-tint)',
  connectorNormal: 'var(--studio-accent-soft-dark)',
  connectorHover: 'var(--studio-accent-soft-hover)',
  connectorSelected: 'var(--studio-accent-soft-dark)',
  clipBackstageBg: 'var(--studio-accent)',
  clipBackstageBorder: 'var(--studio-accent-hover)',
  clipGsapBg: '#6b8f71',
  clipGsapBorder: '#8fb396',
  clipGsapTimelineBg: '#5a735e',
  clipGsapTimelineBorder: '#8fb396',
  clipGsapChildBg: '#4d6b52',
  clipGsapChildBorder: '#6b8f71',
  aggregateKeyframePrimary: 'var(--studio-accent-soft)',
  aggregateKeyframeSecondary: 'var(--studio-accent-secondary)',
  aggregateKeyframeSelected: '#F2C95C',
  scrollTriggerParentBg: '#4a5a8f',
  scrollTriggerParentBorder: '#7a8fc4',
  scrollTriggerChildBg: '#3d4d72',
  scrollTriggerChildBorder: '#5a6a94',
}

const DEEMPHASIZED: SequencerTrackColorTokens = {
  keyframeDotNormal: '#4a4f56',
  keyframeDotSelected: '#6a6044',
  keyframeDotInlineEditorOpen: '#565b62',
  keyframeDotSelectedInlineEditorOpen: '#525760',
  connectorNormal: '#434850',
  connectorHover: '#50555d',
  connectorSelected: '#434850',
  clipBackstageBg: '#3f444b',
  clipBackstageBorder: '#4f555e',
  clipGsapBg: '#3d463f',
  clipGsapBorder: '#4f5a52',
  clipGsapTimelineBg: '#363e38',
  clipGsapTimelineBorder: '#4f5a52',
  clipGsapChildBg: '#38403a',
  clipGsapChildBorder: '#4a554d',
  aggregateKeyframePrimary: '#4a4f56',
  aggregateKeyframeSecondary: '#42464d',
  aggregateKeyframeSelected: '#6a6044',
  scrollTriggerParentBg: '#353b4a',
  scrollTriggerParentBorder: '#4a5268',
  scrollTriggerChildBg: '#2f3542',
  scrollTriggerChildBorder: '#424a5c',
}

export function sequencerTrackColorTokens(
  emphasis: SequencerTrackEmphasis,
): SequencerTrackColorTokens {
  return emphasis === 'emphasized' ? EMPHASIZED : DEEMPHASIZED
}

export function sequencerTrackEmphasisCssVariables(
  emphasis: SequencerTrackEmphasis,
) {
  const c = sequencerTrackColorTokens(emphasis)
  return css`
    --sequencer-kf-dot-normal: ${c.keyframeDotNormal};
    --sequencer-kf-dot-selected: ${c.keyframeDotSelected};
    --sequencer-kf-dot-inline-open: ${c.keyframeDotInlineEditorOpen};
    --sequencer-kf-dot-selected-inline-open: ${c.keyframeDotSelectedInlineEditorOpen};
    --sequencer-connector-normal: ${c.connectorNormal};
    --sequencer-connector-hover: ${c.connectorHover};
    --sequencer-connector-selected: ${c.connectorSelected};
    --sequencer-clip-backstage-bg: ${c.clipBackstageBg};
    --sequencer-clip-backstage-border: ${c.clipBackstageBorder};
    --sequencer-clip-gsap-bg: ${c.clipGsapBg};
    --sequencer-clip-gsap-border: ${c.clipGsapBorder};
    --sequencer-clip-gsap-timeline-bg: ${c.clipGsapTimelineBg};
    --sequencer-clip-gsap-timeline-border: ${c.clipGsapTimelineBorder};
    --sequencer-clip-gsap-child-bg: ${c.clipGsapChildBg};
    --sequencer-clip-gsap-child-border: ${c.clipGsapChildBorder};
    --sequencer-agg-kf-primary: ${c.aggregateKeyframePrimary};
    --sequencer-agg-kf-secondary: ${c.aggregateKeyframeSecondary};
    --sequencer-agg-kf-selected: ${c.aggregateKeyframeSelected};
    --sequencer-st-parent-bg: ${c.scrollTriggerParentBg};
    --sequencer-st-parent-border: ${c.scrollTriggerParentBorder};
    --sequencer-st-child-bg: ${c.scrollTriggerChildBg};
    --sequencer-st-child-border: ${c.scrollTriggerChildBorder};
  `
}
