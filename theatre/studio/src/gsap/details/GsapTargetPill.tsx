import type {GsapTargetDescriptor} from '@unseenco/theatre-shared/gsap/introspectGsapTweenDetails'
import {readGsapObjectPreviewEntries} from '@unseenco/theatre-shared/gsap/introspectGsapTweenDetails'
import {useDomElementHighlight} from '@unseenco/theatre-studio/gsap/useDomElementHighlight'
import useTooltip from '@unseenco/theatre-studio/uiComponents/Popover/useTooltip'
import React from 'react'
import styled from 'styled-components'

const Pill = styled.button<{kind: 'element' | 'object'}>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  margin: 0 4px 0 0;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid
    ${(p) =>
      p.kind === 'element'
        ? 'rgba(0, 160, 220, 0.45)'
        : 'rgba(160, 160, 160, 0.35)'};
  background: rgba(255, 255, 255, 0.06);
  color: #c8c8c8;
  font-size: 10px;
  line-height: 1.3;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: var(--studio-text-focus);
  }
`

const KindTag = styled.span`
  flex: 0 0 auto;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #888;
`

const PreviewList = styled.dl`
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: auto auto;
  gap: 2px 10px;
  font-size: 10px;
  width: max-content;
  max-width: 280px;
`

const PreviewKey = styled.dt`
  margin: 0;
  color: #999;
`

const PreviewValue = styled.dd`
  margin: 0;
  color: #ddd;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const GsapObjectPreviewPopover: React.VFC<{value: unknown}> = ({value}) => {
  const entries = readGsapObjectPreviewEntries(value)
  if (entries.length === 0) {
    return <span>(no enumerable keys)</span>
  }
  return (
    <PreviewList>
      {entries.map((row) => (
        <React.Fragment key={row.key}>
          <PreviewKey>{row.key}</PreviewKey>
          <PreviewValue title={row.displayValue}>
            {row.displayValue}
          </PreviewValue>
        </React.Fragment>
      ))}
    </PreviewList>
  )
}

const GsapTargetPill: React.VFC<{target: GsapTargetDescriptor}> = ({
  target,
}) => {
  const {showElementHighlight, hideElementHighlight} = useDomElementHighlight()

  if (target.kind === 'element') {
    return (
      <Pill
        type="button"
        kind="element"
        title={`Page element ${target.label}`}
        onMouseEnter={() => {
          showElementHighlight(target.element)
        }}
        onMouseLeave={() => {
          hideElementHighlight()
        }}
        onClick={() => {
          if (target.element.isConnected) {
            target.element.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
          }
        }}
      >
        <KindTag>Element</KindTag>
        <span>{target.label}</span>
      </Pill>
    )
  }

  const [tooltip, targetRef] = useTooltip<HTMLButtonElement>(
    {enterDelay: 200, exitDelay: 100, verticalPlacement: 'bottom'},
    () => (
      <div
        style={{
          padding: '6px 8px',
          background: '#2a2a2a',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 4,
          width: 'max-content',
          maxWidth: 280,
        }}
      >
        <GsapObjectPreviewPopover value={target.value} />
      </div>
    ),
  )

  return (
    <>
      <Pill
        ref={targetRef}
        type="button"
        kind="object"
        title="GSAP target object"
      >
        <KindTag>Object</KindTag>
        <span>{target.label}</span>
      </Pill>
      {tooltip}
    </>
  )
}

export default GsapTargetPill
