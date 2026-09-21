import styled, {css} from 'styled-components'
import {pointerEventsAutoInNormalMode} from '@unseenco/backstage/studio/css'

export type SequencerClipBarColorScheme = 'gsap' | 'gsapTimeline' | 'backstage'

const gsapTweenBarColors = css`
  background: var(--sequencer-clip-gsap-bg, #6b8f71);
  border: 1px solid var(--sequencer-clip-gsap-border, #8fb396);
`

const gsapTimelineBarColors = css`
  background: var(--sequencer-clip-gsap-timeline-bg, #5a735e);
  border: 1px solid var(--sequencer-clip-gsap-timeline-border, #8fb396);
`

const backstageBarColors = css`
  background: var(--sequencer-clip-backstage-bg, var(--studio-accent));
  border: 1px solid
    var(--sequencer-clip-backstage-border, var(--studio-accent-hover));
`

export const SequencerClipBarTrackContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`

export const SequencerClipBar = styled.div<{
  $colorScheme: SequencerClipBarColorScheme
  $interactive?: boolean
}>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 14px;
  border-radius: 3px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 3;
  ${pointerEventsAutoInNormalMode};

  ${(p) =>
    p.$colorScheme === 'gsapTimeline'
      ? gsapTimelineBarColors
      : p.$colorScheme === 'gsap'
      ? gsapTweenBarColors
      : backstageBarColors}

  ${(p) =>
    p.$interactive !== false &&
    css`
      cursor: grab;
    `}
`

export const SequencerClipBarLabel = styled.span`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.85);
  pointer-events: none;
  user-select: none;
  padding: 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`

export const SequencerClipBarEdgeHandle = styled.div<{$side: 'left' | 'right'}>`
  position: absolute;
  top: -5px;
  bottom: -5px;
  width: 12px;
  cursor: ew-resize;
  z-index: 1;
  ${(props) => (props.$side === 'left' ? 'left: 0;' : 'right: 0;')}

  &::after {
    content: '';
    position: absolute;
    top: 7px;
    bottom: 7px;
    width: 2px;
    border-radius: 1px;
    background: rgba(255, 255, 255, 0.35);
    ${(props) => (props.$side === 'left' ? 'left: 4px;' : 'right: 4px;')}
  }
`
