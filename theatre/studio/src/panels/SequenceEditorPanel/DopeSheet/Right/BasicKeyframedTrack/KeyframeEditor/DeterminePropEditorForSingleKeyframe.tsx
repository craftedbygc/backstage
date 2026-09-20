import React, {useRef} from 'react'
import styled from 'styled-components'

import type {PropTypeConfig_AllSimples} from '@unseenco/theatre-core/propTypes'
import type {ISimplePropEditorReactProps} from '@unseenco/theatre-studio/propEditors/simpleEditors/ISimplePropEditorReactProps'
import {simplePropEditorByPropType} from '@unseenco/theatre-studio/propEditors/simpleEditors/simplePropEditorByPropType'
import type {
  EditingOptionsTree,
  PrimitivePropEditingOptions,
} from './useSingleKeyframeInlineEditorPopover'
import last from 'lodash-es/last'
import {useTempTransactionEditingTools} from './useTempTransactionEditingTools'
import {valueInProp} from '@unseenco/backstage-shared/propTypes/utils'
import {
  getStudioSequence,
  getStudioTrackSequenceVariant,
} from '@unseenco/theatre-studio/utils/activeSequenceVariant'
import {ChevronDown} from '@unseenco/theatre-studio/uiComponents/icons'

const INDENT_PX = 14
/** Extra inset for hierarchy section titles (transform, position, …). */
const SECTION_LABEL_BASE_PADDING_PX = 10
const PROP_ROW_BASE_PADDING_PX = 10

function sectionLabelPaddingLeft(indent: number): number {
  return SECTION_LABEL_BASE_PADDING_PX + indent * INDENT_PX
}

function propRowPaddingLeft(indent: number): number {
  return PROP_ROW_BASE_PADDING_PX + indent * INDENT_PX
}

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 500;
  line-height: 13px;
  letter-spacing: 0.01em;
  padding: 2px 0 4px 0;
  color: var(--studio-text-muted, #919191);
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  box-sizing: border-box;
`

const SectionLabelText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
`

const SectionChevron = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 12px;
  height: 12px;
  font-size: 12px;
  color: var(--studio-text-muted, #919191);
  pointer-events: none;
`

const Row = styled.div`
  display: flex;
  align-items: stretch;
  width: 100%;
  min-width: 160px;
  max-width: 320px;
  padding: 0;
  box-sizing: border-box;

  select {
    min-width: 100px;
  }
`

/**
 * Content row inside the keyframe popover. The popover shell itself is the
 * chip surface (see KeyframeInlineEditorPopover); this only lays out label + value.
 */
const Chip = styled.div<{
  $interactive: boolean
  $paddingLeftPx: number
  /** Number rows: chip is full-bleed; label/value inset lives in BasicNumberInput. */
  $fullBleedRange: boolean
}>`
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  min-height: var(--studio-row-height, 36px);
  height: var(--studio-row-height, 36px);
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: ${(props) =>
    props.$fullBleedRange ? '0' : `0 10px 0 ${props.$paddingLeftPx}px`};
  box-sizing: border-box;
  background: transparent;
  border-radius: var(--studio-radius);
  ${(props) => (props.$interactive ? 'cursor: pointer;' : '')}

  &:hover {
    background: var(--studio-chip-bg-hover, #3e4248);
  }
`

const PropName = styled.div<{
  $interactive?: boolean
}>`
  /* Labels keep full natural width; only the value slot may shrink. */
  flex: 0 0 auto;
  white-space: nowrap;
  display: flex;
  align-items: center;
  user-select: none;
  cursor: ${(props) => (props.$interactive ? 'pointer' : 'default')};
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text-label);
`

const InputSlot = styled.div<{
  $fullBleed: boolean
}>`
  display: flex;
  align-items: center;
  align-self: stretch;
  box-sizing: border-box;
  min-height: var(--studio-row-height, 36px);
  height: 100%;
  min-width: 0;
  overflow: hidden;
  ${(props) =>
    props.$fullBleed
      ? `
    flex: 1 1 auto;
    width: 100%;
    justify-content: stretch;
  `
      : `
    flex: 1 1 auto;
    justify-content: flex-end;
  `}
`

function HierarchySectionLabel({
  indent,
  children,
}: {
  indent: number
  children: React.ReactNode
}) {
  return (
    <SectionLabel style={{paddingLeft: `${sectionLabelPaddingLeft(indent)}px`}}>
      <SectionLabelText>{children}</SectionLabelText>
      <SectionChevron aria-hidden>
        <ChevronDown width={12} height={12} />
      </SectionChevron>
    </SectionLabel>
  )
}

function editorOwnsLabel(propType: string): boolean {
  return propType === 'number'
}

function chipHostClickable(propType: string): boolean {
  return (
    propType === 'boolean' ||
    propType === 'string' ||
    propType === 'rgba' ||
    propType === 'image'
  )
}

/**
 * Given a propConfig, this function gives the corresponding prop editor for
 * use in the dope sheet inline prop editor on a keyframe.
 * {@link DeterminePropEditorForDetail} does the same thing for the details panel. The main difference
 * between this function and {@link DeterminePropEditorForDetail} is that this
 * one shows prop editors *without* keyframe navigation controls (that look
 * like `< ・ >`).
 *
 * @param p - propConfig object for any type of prop.
 */
export function DeterminePropEditorForKeyframeTree(
  p: EditingOptionsTree & {autoFocusInput?: boolean; indent: number},
) {
  if (p.type === 'sheetObject') {
    return (
      <>
        <HierarchySectionLabel indent={p.indent}>
          {p.sheetObject.address.objectKey}
        </HierarchySectionLabel>
        {p.children.map((c, i) => (
          <DeterminePropEditorForKeyframeTree
            key={i}
            {...c}
            autoFocusInput={p.autoFocusInput && i === 0}
            indent={p.indent + 1}
          />
        ))}
      </>
    )
  } else if (p.type === 'propWithChildren') {
    const label = p.propConfig.label ?? last(p.pathToProp)
    return (
      <>
        <HierarchySectionLabel indent={p.indent}>{label}</HierarchySectionLabel>
        {p.children.map((c, i) => (
          <DeterminePropEditorForKeyframeTree
            key={i}
            {...c}
            autoFocusInput={p.autoFocusInput && i === 0}
            indent={p.indent + 1}
          />
        ))}
      </>
    )
  } else {
    return (
      <PrimitivePropEditor
        {...p}
        autoFocusInput={p.autoFocusInput}
        indent={p.indent}
      />
    )
  }
}

function PrimitivePropEditor(
  p: PrimitivePropEditingOptions & {autoFocusInput?: boolean; indent: number},
) {
  const label = p.propConfig.label ?? last(p.pathToProp)
  const editingTools = useEditingToolsForKeyframeEditorPopover(p)
  const labelText = typeof label === 'string' ? label : String(label ?? '')
  const hostClickRef = useRef<((e: React.MouseEvent) => void) | null>(null)

  if (p.propConfig.type === 'enum') {
    // notice: enums are not implemented, yet.
    return <></>
  }

  const PropEditor = simplePropEditorByPropType[p.propConfig.type] as React.VFC<
    ISimplePropEditorReactProps<PropTypeConfig_AllSimples>
  >

  const ownsLabel = editorOwnsLabel(p.propConfig.type)
  const interactive = chipHostClickable(p.propConfig.type)
  const rowPaddingLeftPx = propRowPaddingLeft(p.indent)

  return (
    <Row>
      <Chip
        data-detail-prop-chip=""
        $interactive={interactive}
        $paddingLeftPx={rowPaddingLeftPx}
        $fullBleedRange={ownsLabel}
        onClick={
          interactive
            ? (e) => {
                hostClickRef.current?.(e)
              }
            : undefined
        }
      >
        {!ownsLabel && (
          <PropName $interactive={interactive}>{labelText}</PropName>
        )}
        <InputSlot $fullBleed={ownsLabel}>
          <PropEditor
            editingTools={editingTools}
            propConfig={p.propConfig}
            value={valueInProp(p.keyframe.value, p.propConfig)}
            autoFocus={p.autoFocusInput}
            {...(ownsLabel
              ? {
                  label: labelText,
                  embedded: true,
                  contentPadding: `0 10px 0 ${rowPaddingLeftPx}px`,
                }
              : {})}
            {...(interactive ? {hostClickRef} : {})}
          />
        </InputSlot>
      </Chip>
    </Row>
  )
}

// These editing tools are distinct from the editing tools used in the
// prop editors in the details panel: These editing tools edit the value of a keyframe
// while the details editing tools edit the value of the sequence at the playhead
// (potentially creating a new keyframe).
function useEditingToolsForKeyframeEditorPopover(
  props: PrimitivePropEditingOptions,
) {
  const obj = props.sheetObject
  return useTempTransactionEditingTools(({stateEditors}, value) => {
    const newKeyframe = {...props.keyframe, value}
    stateEditors.coreByProject.historic.sheetsById.sequence.replaceKeyframes({
      ...obj.address,
      trackId: props.trackId,
      keyframes: [newKeyframe],
      snappingFunction: getStudioSequence(obj.sheet).closestGridPosition,
      sequenceVariant: getStudioTrackSequenceVariant(obj, props.trackId),
    })
  }, obj)
}
