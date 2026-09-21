import {theme} from '@unseenco/backstage/studio/css'
import type {
  SequenceEditorTree_GsapClipTrack,
  SequenceEditorTree_GsapScrollTriggerChild,
  SequenceEditorTree_GsapScrollTriggerTrack,
  SequenceEditorTree_ObjectNamespace,
  SequenceEditorTree_PrimitiveProp,
  SequenceEditorTree_PropWithChildren,
  SequenceEditorTree_Sheet,
  SequenceEditorTree_SheetObject,
} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/tree'
import type {VoidFn} from '@unseenco/backstage-shared/utils/types'
import React, {useState} from 'react'
import {HiOutlineChevronRight} from 'react-icons/all'
import styled from 'styled-components'
import {propNameTextCSS} from '@unseenco/backstage/studio/propEditors/utils/propNameTextCSS'
import {usePropHighlightMouseEnter} from './usePropHighlightMouseEnter'
import {useGsapSequencerRowElementHighlight} from '@unseenco/backstage/studio/gsap/useGsapSequencerRowElementHighlight'
import {
  SEQUENCER_LEFT_DEPTH_INDENT_PX,
  SEQUENCER_LEFT_HIERARCHY_LINE_COLOR,
  sequencerLeftHierarchyLineLeftPx,
} from './sequencerLeftPanelLayout'

export const LeftRowContainer = styled.li<{depth: number}>`
  --depth: ${(props) => props.depth};
  margin: 0;
  padding: 0;
  list-style: none;
`

export const BaseHeader = styled.div<{isEven: boolean}>`
  border-bottom: 1px solid #7695b705;
`

const LeftRowHeader = styled(BaseHeader)<{
  isSelectable: boolean
  isSelected: boolean
}>`
  padding-left: calc(var(--depth) * ${SEQUENCER_LEFT_DEPTH_INDENT_PX}px);

  display: flex;
  align-items: stretch;
  color: ${theme.panel.body.compoudThing.label.color};

  box-sizing: border-box;

  ${(props) => props.isSelected && `background: var(--studio-surface-active)`};
`

const LeftRowHead_Label = styled.span`
  ${propNameTextCSS};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 4px;
  line-height: 26px;
  flex: 0 1 auto;
  min-width: 0;

  ${LeftRowHeader}:hover & {
    color: #ccc;
  }
`

const LeftRowHead_Icon = styled.span<{isCollapsed: boolean}>`
  width: 18px;
  height: 26px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  cursor: pointer;

  transition: transform 0.05s ease-out, color 0.1s ease-out,
    opacity 0.1s ease-out;
  transform: rotateZ(${(props) => (props.isCollapsed ? 0 : 90)}deg);
  color: #8b8e92;
  opacity: ${(props) => (props.isCollapsed ? 1 : 0.7)};

  ${LeftRowHeader}:hover & {
    opacity: 1;
  }

  &:hover {
    transform: rotateZ(${(props) => (props.isCollapsed ? 15 : 75)}deg);
    color: #c0c4c9;
  }
`

const LeftRowChildren = styled.ul<{$childDepth: number}>`
  margin: 0;
  padding: 0;
  list-style: none;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: ${(props) => sequencerLeftHierarchyLineLeftPx(props.$childDepth)}px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: ${SEQUENCER_LEFT_HIERARCHY_LINE_COLOR};
    pointer-events: none;
  }
`

const AnyCompositeRow: React.FC<{
  leaf:
    | SequenceEditorTree_Sheet
    | SequenceEditorTree_PrimitiveProp
    | SequenceEditorTree_PropWithChildren
    | SequenceEditorTree_SheetObject
    | SequenceEditorTree_ObjectNamespace
    | SequenceEditorTree_GsapClipTrack
    | SequenceEditorTree_GsapScrollTriggerTrack
    | SequenceEditorTree_GsapScrollTriggerChild
  label: React.ReactNode
  toggleSelect?: VoidFn
  toggleCollapsed: VoidFn
  isSelected?: boolean
  isSelectable?: boolean
  isCollapsed: boolean
  children?: React.ReactNode
}> = ({
  leaf,
  label,
  children,
  isSelectable,
  isSelected,
  toggleSelect,
  toggleCollapsed,
  isCollapsed,
}) => {
  const hasChildren = Array.isArray(children) && children.length > 0

  const [rowHeaderEl, setRowHeaderEl] = useState<HTMLDivElement | null>(null)

  usePropHighlightMouseEnter(rowHeaderEl, leaf)
  useGsapSequencerRowElementHighlight(rowHeaderEl, leaf)

  return leaf.shouldRender ? (
    <LeftRowContainer depth={leaf.depth}>
      <LeftRowHeader
        ref={setRowHeaderEl}
        style={{
          height: leaf.nodeHeight + 'px',
        }}
        isSelectable={isSelectable === true}
        isSelected={isSelected === true}
        onClick={toggleSelect}
        isEven={leaf.n % 2 === 0}
      >
        {hasChildren ? (
          <LeftRowHead_Icon
            isCollapsed={isCollapsed}
            onClick={(e) => {
              e.stopPropagation()
              toggleCollapsed()
            }}
          >
            <HiOutlineChevronRight />
          </LeftRowHead_Icon>
        ) : (
          <span style={{width: 18, flex: '0 0 auto'}} />
        )}
        <LeftRowHead_Label>{label}</LeftRowHead_Label>
      </LeftRowHeader>
      {hasChildren && (
        <LeftRowChildren $childDepth={leaf.depth + 1}>
          {children}
        </LeftRowChildren>
      )}
    </LeftRowContainer>
  ) : null
}

export default AnyCompositeRow
