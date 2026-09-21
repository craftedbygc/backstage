import React, {useLayoutEffect, useRef, useState} from 'react'
import styled from 'styled-components'
import {mergeRefs} from 'react-merge-refs'
import useTooltip from '@unseenco/backstage/studio/uiComponents/Popover/useTooltip'
import MinimalTooltip from '@unseenco/backstage/studio/uiComponents/Popover/MinimalTooltip'

const CONNECTOR_HEIGHT = 2
const CONNECTOR_HEIGHT_HOVER = 4
const CONNECTOR_HEIGHT_WITH_LABEL = 12

export type IConnectorThemeValues = {
  isPopoverOpen: boolean
  isSelected: boolean
  hasTweenLabel: boolean
  isHovered: boolean
}

function connectorVisualBackground(values: IConnectorThemeValues): string {
  if (values.isPopoverOpen) {
    return 'var(--sequencer-connector-hover)'
  }
  if (values.isHovered) {
    return 'var(--sequencer-connector-hover)'
  }
  if (values.isSelected) {
    return 'var(--sequencer-connector-selected)'
  }
  return 'var(--sequencer-connector-normal)'
}

function connectorVisualHeight(values: IConnectorThemeValues): number {
  if (values.hasTweenLabel) {
    return CONNECTOR_HEIGHT_WITH_LABEL
  }
  if (values.isHovered && !values.isPopoverOpen) {
    return CONNECTOR_HEIGHT_HOVER
  }
  return CONNECTOR_HEIGHT
}

const HitTarget = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: var(--sequencer-track-row-height, 28px);
  transform: translateY(calc(-1 * var(--sequencer-track-row-height, 28px) / 2));
  z-index: 0;
  cursor: ew-resize;
`

const VisualBar = styled.div<IConnectorThemeValues>`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: ${(props) => connectorVisualBackground(props)};
  height: ${(props) => connectorVisualHeight(props)}px;
  width: 100%;
  transform-origin: center center;
  transition: height 0.08s ease-out, background 0.08s ease-out;
  overflow: hidden;
  pointer-events: none;
`

const Label = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 0 6px;
  box-sizing: border-box;
  pointer-events: none;
  overflow: hidden;
  min-width: 0;
`

const LabelText = styled.span`
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  font-size: 9px;
  line-height: 1;
`

type IConnectorLineProps = React.PropsWithChildren<{
  isPopoverOpen: boolean
  openPopover?: (event: React.MouseEvent) => void
  isSelected: boolean
  connectorLengthInUnitSpace: number
  tweenLabel?: string
}>

export const ConnectorLine = React.forwardRef<
  HTMLDivElement,
  IConnectorLineProps
>((props, ref) => {
  const hasTweenLabel = !!props.tweenLabel
  const [isHovered, setIsHovered] = useState(false)
  const wasPopoverOpenRef = useRef(props.isPopoverOpen)
  /** Skips one `mouseenter` after the ease popover closes (overlay removal refires it). */
  const ignoreNextMouseEnterRef = useRef(false)

  useLayoutEffect(() => {
    if (props.isPopoverOpen) {
      setIsHovered(false)
    } else if (wasPopoverOpenRef.current) {
      setIsHovered(false)
      ignoreNextMouseEnterRef.current = true
    }
    wasPopoverOpenRef.current = props.isPopoverOpen
  }, [props.isPopoverOpen])

  const themeValues: IConnectorThemeValues = {
    isPopoverOpen: props.isPopoverOpen,
    isSelected: props.isSelected,
    hasTweenLabel,
    isHovered,
  }

  const [tooltipNode, tooltipTargetRef] = useTooltip(
    {enabled: hasTweenLabel, enterDelay: 300},
    () => <MinimalTooltip>{props.tweenLabel}</MinimalTooltip>,
  )

  return (
    <>
      <HitTarget
        ref={mergeRefs([ref, tooltipTargetRef])}
        style={{
          width: `calc(var(--unitSpaceToScaledSpaceMultiplier) * ${props.connectorLengthInUnitSpace}px)`,
        }}
        onMouseEnter={() => {
          if (ignoreNextMouseEnterRef.current) {
            ignoreNextMouseEnterRef.current = false
            return
          }
          setIsHovered(true)
        }}
        onMouseMove={() => {
          if (ignoreNextMouseEnterRef.current) {
            ignoreNextMouseEnterRef.current = false
          }
          if (!props.isPopoverOpen) {
            setIsHovered(true)
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          ignoreNextMouseEnterRef.current = false
        }}
        onClick={(e) => {
          setIsHovered(false)
          props.openPopover?.(e)
        }}
      >
        <VisualBar {...themeValues}>
          {hasTweenLabel ? (
            <Label>
              <LabelText>{props.tweenLabel}</LabelText>
            </Label>
          ) : undefined}
        </VisualBar>
      </HitTarget>
      {props.children}
      {tooltipNode}
    </>
  )
})
