import React from 'react'
import type {$IntentionalAny} from '@unseenco/backstage-shared/utils/types'
import {val} from '@unseenco/backstage/dataverse'
import {usePrism, useVal} from '@unseenco/backstage/react'
import styled, {keyframes} from 'styled-components'
import usePopoverPosition from '@unseenco/backstage/studio/uiComponents/Popover/usePopoverPosition'
import {pointerEventsAutoInNormalMode} from '@unseenco/backstage/studio/css'
import {tooltipTarget} from './tooltipActor'

export const TooltipOverlay: React.FC<{}> = () => {
  const currentTarget = useVal(tooltipTarget)

  const tooltipDisabled =
    useVal(currentTarget?.atom.pointer.tooltipDisabled) ?? false

  const title = usePrism((): React.ReactNode => {
    const chordial = currentTarget
    if (!chordial) return null
    const a = chordial.atom
    const optsFn = val(a.pointer.optsFn)
    const opts = optsFn()
    return opts.title
  }, [currentTarget])

  const [popoverContainerRef, positioning] = usePopoverPosition({
    target: currentTarget?.target,
  })

  const chordial = currentTarget
  const visible = Boolean(chordial && positioning && !tooltipDisabled)

  return (
    <>
      {title && (
        <MeasureContainer
          ref={popoverContainerRef as React.MutableRefObject<$IntentionalAny>}
        >
          <Title>{title}</Title>
        </MeasureContainer>
      )}

      {visible && positioning && (
        <TooltipContainer
          $visible={visible}
          style={{
            left: positioning.left + 'px',
            top: positioning.top + 'px',
          }}
        >
          <Title>{title}</Title>
        </TooltipContainer>
      )}
    </>
  )
}

const tooltipEnter = keyframes`
  from {
    opacity: 0.5;
    transform: translateY(0px) perspective(200px) scale(0.95) rotateX(-45deg);
  }
  to {
    opacity: 1;
    transform: translateY(0px) perspective(200px) scale(1) rotateX(0deg);
  }
`

const MeasureContainer = styled.div`
  display: flex;
  align-items: center;
  height: 30px;
  position: absolute;
  opacity: 0;
  pointer-events: none;
`

const TooltipContainer = styled.div<{$visible: boolean}>`
  display: flex;
  align-items: center;
  height: 30px;
  position: absolute;
  transform-origin: top center;
  animation: ${tooltipEnter} 132ms ease-out;
  opacity: ${(p) => (p.$visible ? 1 : 0)};

  cursor: default;
  ${pointerEventsAutoInNormalMode};

  color: white;
  box-sizing: border-box;

  border-radius: 4px;
  background-color: var(--studio-popover-bg, #282b2f);
  border: 0.5px solid #565e66;
  z-index: 10000;
  padding: 8px 8px;
  font-size: 10px;

  & a {
    color: inherit;
  }

  max-width: 240px;
  padding: 8px;
  pointer-events: none !important;
`

const Title = styled.div`
  text-wrap: nowrap;
`
