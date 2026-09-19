import type {SequenceEditorTree_PrimitiveProp} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import getStudio from '@unseenco/theatre-studio/getStudio'
import {encodePathToProp} from '@unseenco/theatre-shared/utils/addresses'
import pointerDeep from '@unseenco/theatre-shared/utils/pointerDeep'
import {usePrism} from '@unseenco/theatre-react'
import type {$IntentionalAny} from '@unseenco/theatre-shared/utils/types'
import type {Pointer} from '@unseenco/theatre-dataverse'
import {val} from '@unseenco/theatre-dataverse'
import React, {useCallback, useRef} from 'react'
import styled from 'styled-components'
import {useEditingToolsForSimplePropInDetailsPanel} from '@unseenco/theatre-studio/propEditors/useEditingToolsForSimpleProp'
import {nextPrevCursorsTheme} from '@unseenco/theatre-studio/propEditors/NextPrevKeyframeCursors'
import {graphEditorColors} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/GraphEditor/GraphEditor'
import {BaseHeader, LeftRowContainer as BaseContainer} from './AnyCompositeRow'
import {propNameTextCSS} from '@unseenco/theatre-studio/propEditors/utils/propNameTextCSS'
import {usePropHighlightMouseEnter} from './usePropHighlightMouseEnter'
import {useSequenceEditorPaneLayout} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/SequenceEditorPaneLayoutContext'
import NextPrevKeyframeCursors from '@unseenco/theatre-studio/propEditors/NextPrevKeyframeCursors'
import {SEQUENCE_EDITOR_DOCKED_LEFT_HEAD_PADDING_RIGHT_PX} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/sequenceEditorLayoutConstants'

const theme = {
  label: {
    color: `#9a9a9a`,
  },
}

const PrimitivePropRowContainer = styled(BaseContainer)<{}>``

const PrimitivePropRowHead = styled(BaseHeader)<{
  isSelected: boolean
  isEven: boolean
  $docked?: boolean
}>`
  display: flex;
  color: ${theme.label.color};
  padding-right: ${(props) =>
    props.$docked
      ? `${SEQUENCE_EDITOR_DOCKED_LEFT_HEAD_PADDING_RIGHT_PX}px`
      : '12px'};
  align-items: center;
  justify-content: flex-end;
  box-sizing: border-box;
  width: ${(props) => (props.$docked ? '100%' : 'auto')};
  max-width: ${(props) => (props.$docked ? '100%' : 'none')};
  min-width: 0;
  overflow: ${(props) => (props.$docked ? 'hidden' : 'visible')};
`

const PrimitivePropRowHead_Controls = styled.div<{$docked?: boolean}>`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  min-width: 0;
  max-width: ${(props) => (props.$docked ? '100%' : 'none')};
`

const PrimitivePropRowIconContainer = styled.button<{
  isSelected: boolean
  graphEditorColor: keyof typeof graphEditorColors
  $docked?: boolean
}>`
  background: none;
  border: none;
  outline: none;
  display: flex;
  box-sizing: border-box;
  font-size: 14px;
  align-items: center;
  height: 100%;
  margin-left: ${(props) => (props.$docked ? '4px' : '12px')};
  flex: 0 0 auto;
  color: ${(props) =>
    props.isSelected
      ? graphEditorColors[props.graphEditorColor].iconColor
      : nextPrevCursorsTheme.offColor};

  &:not([disabled]):hover {
    color: white;
  }
`

const GraphIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="10"
    height="12"
    viewBox="0 0 640 512"
  >
    <g transform="translate(0 100)">
      <path
        fill="currentColor"
        d="M368 32h-96c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32zM208 88h-84.75C113.75 64.56 90.84 48 64 48 28.66 48 0 76.65 0 112s28.66 64 64 64c26.84 0 49.75-16.56 59.25-40h79.73c-55.37 32.52-95.86 87.32-109.54 152h49.4c11.3-41.61 36.77-77.21 71.04-101.56-3.7-8.08-5.88-16.99-5.88-26.44V88zm-48 232H64c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32zM576 48c-26.84 0-49.75 16.56-59.25 40H432v72c0 9.45-2.19 18.36-5.88 26.44 34.27 24.35 59.74 59.95 71.04 101.56h49.4c-13.68-64.68-54.17-119.48-109.54-152h79.73c9.5 23.44 32.41 40 59.25 40 35.34 0 64-28.65 64-64s-28.66-64-64-64zm0 272h-96c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32z"
      />
    </g>
  </svg>
)

const PrimitivePropRowHead_Label = styled.span<{$docked?: boolean}>`
  margin-right: 4px;
  ${propNameTextCSS};
  flex: ${(props) => (props.$docked ? '1 1 0' : '0 1 auto')};
  min-width: 0;
  overflow: ${(props) => (props.$docked ? 'hidden' : 'visible')};
  text-overflow: ${(props) => (props.$docked ? 'ellipsis' : 'clip')};
  white-space: nowrap;

  ${PrimitivePropRowHead}:hover & {
    color: #ccc;
  }
`

const PrimitivePropRow: React.FC<{
  leaf: SequenceEditorTree_PrimitiveProp
}> = ({leaf}) => {
  const pointerToProp = pointerDeep(
    leaf.sheetObject.propsP,
    leaf.pathToProp,
  ) as Pointer<$IntentionalAny>

  const obj = leaf.sheetObject
  const {controlIndicators} = useEditingToolsForSimplePropInDetailsPanel(
    pointerToProp,
    obj,
    leaf.propConf,
  )

  const possibleColor = usePrism(() => {
    const c = leaf.sheetObject.address
    const encodedPathToProp = encodePathToProp(leaf.pathToProp)
    return val(
      getStudio()!.atomP.historic.projects.stateByProjectId[c.projectId]
        .stateBySheetId[c.sheetId].sequenceEditor.selectedPropsByObject[
        c.objectKey
      ][encodedPathToProp],
    )
  }, [leaf])

  const isSelectedRef = useRef<boolean>(false)
  const isSelected = typeof possibleColor === 'string'
  isSelectedRef.current = isSelected

  const toggleSelect = useCallback(() => {
    const c = leaf.sheetObject.address
    getStudio()!.transaction(({stateEditors}) => {
      if (isSelectedRef.current) {
        stateEditors.studio.historic.projects.stateByProjectId.stateBySheetId.sequenceEditor.removePropFromGraphEditor(
          {...c, pathToProp: leaf.pathToProp},
        )
      } else {
        stateEditors.studio.historic.projects.stateByProjectId.stateBySheetId.sequenceEditor.addPropToGraphEditor(
          {...c, pathToProp: leaf.pathToProp},
        )
        stateEditors.studio.historic.panels.sequenceEditor.graphEditor.setIsOpen(
          {
            isOpen: true,
          },
        )
      }
    })
  }, [leaf])

  const {isDocked} = useSequenceEditorPaneLayout()

  const label =
    leaf.propConf.label ?? leaf.pathToProp[leaf.pathToProp.length - 1]
  const isSelectable = true

  const headRef = useRef<HTMLDivElement | null>(null)

  usePropHighlightMouseEnter(headRef.current, leaf)

  const selectParentObject = useCallback(() => {
    getStudio()!.transaction(({stateEditors}) => {
      stateEditors.studio.historic.panels.outline.selection.set([
        leaf.sheetObject,
      ])
    })
  }, [leaf.sheetObject])

  return (
    <PrimitivePropRowContainer depth={leaf.depth}>
      <PrimitivePropRowHead
        ref={headRef}
        isEven={leaf.n % 2 === 0}
        style={{
          height: leaf.nodeHeight + 'px',
        }}
        isSelected={isSelected === true}
        $docked={isDocked}
        onClick={selectParentObject}
      >
        <PrimitivePropRowHead_Label $docked={isDocked}>
          {label}
        </PrimitivePropRowHead_Label>
        <PrimitivePropRowHead_Controls $docked={isDocked}>
          {controlIndicators.type === NextPrevKeyframeCursors
            ? React.cloneElement(controlIndicators, {compact: isDocked})
            : controlIndicators}
          <PrimitivePropRowIconContainer
          onClick={(e) => {
            e.stopPropagation()
            toggleSelect()
          }}
          isSelected={isSelected === true}
          graphEditorColor={possibleColor ?? '1'}
          style={{opacity: isSelectable ? 1 : 0.25}}
          disabled={!isSelectable}
          $docked={isDocked}
        >
            <GraphIcon />
          </PrimitivePropRowIconContainer>
        </PrimitivePropRowHead_Controls>
      </PrimitivePropRowHead>
    </PrimitivePropRowContainer>
  )
}

export default PrimitivePropRow
