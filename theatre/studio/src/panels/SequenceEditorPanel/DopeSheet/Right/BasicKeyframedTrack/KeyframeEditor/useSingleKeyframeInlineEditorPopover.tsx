import React, {useCallback, useEffect} from 'react'
import styled from 'styled-components'
import usePopover from '@unseenco/theatre-studio/uiComponents/Popover/usePopover'
import type {
  CloseFn,
  OpenFn,
} from '@unseenco/theatre-studio/uiComponents/Popover/usePopover'
import BasicPopover from '@unseenco/theatre-studio/uiComponents/Popover/BasicPopover'
import {DeterminePropEditorForKeyframeTree} from './DeterminePropEditorForSingleKeyframe'
import type {SequenceTrackId} from '@unseenco/theatre-shared/utils/ids'
import type {Keyframe} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import type {
  PropTypeConfig_AllSimples,
  PropTypeConfig_Compound,
  PropTypeConfig_Enum,
} from '@unseenco/theatre-core/propTypes'
import type {PathToProp} from '@unseenco/theatre-shared/utils/addresses'
import type {UnknownValidCompoundProps} from '@unseenco/theatre-core/propTypes/internals'

/**
 * The popover *is* the edit chip: same fill as the chip, arrow in that color,
 * no outer chrome around a nested chip.
 *
 * `&&` raises specificity so these vars beat BasicPopover’s defaults on the
 * same node (otherwise the arrow tip keeps the gray outer-stroke).
 */
const KeyframeInlineEditorPopover = styled(BasicPopover)`
  && {
    --popover-bg: var(--studio-chip-bg, #393c40);
    --popover-outer-stroke: var(--studio-chip-bg, #393c40);
    --popover-inner-stroke: var(--studio-chip-bg, #393c40);

    background: var(--studio-chip-bg, #393c40);
    border: none;
    border-radius: var(--studio-radius, 4px);
    padding: 6px;
    overflow: hidden;
    min-width: 200px;
    box-sizing: border-box;
  }
`

let openKeyframeInlineEditorPopoverClose: CloseFn | null = null

function closeOpenKeyframeInlineEditorPopover(reason: string) {
  openKeyframeInlineEditorPopoverClose?.(reason)
  openKeyframeInlineEditorPopoverClose = null
}

function hasNonZeroLayoutRect(el: Element): boolean {
  const {width, height} = el.getBoundingClientRect()
  return width > 0 || height > 0
}

/** Prefer a mounted trigger with real layout bounds (avoids popover at 0,0). */
export function resolveKeyframePopoverTarget(
  event: React.MouseEvent | MouseEvent | {clientX: number; clientY: number},
  target: Element | null | undefined,
): Element {
  if (target instanceof Element && hasNonZeroLayoutRect(target)) {
    return target
  }
  if (
    'currentTarget' in event &&
    event.currentTarget instanceof Element &&
    hasNonZeroLayoutRect(event.currentTarget)
  ) {
    return event.currentTarget
  }
  if ('target' in event && event.target instanceof Element) {
    return event.target
  }
  if (target instanceof Element) {
    return target
  }
  throw new Error(
    'useKeyframeInlineEditorPopover: could not resolve popover anchor element',
  )
}

/** The editor that pops up when directly clicking a Keyframe. */
export function useKeyframeInlineEditorPopover(
  props: EditingOptionsTree[] | null,
) {
  const popover = usePopover(
    {
      debugName: 'useKeyframeInlineEditorPopover',
    },
    () => (
      <KeyframeInlineEditorPopover showPopoverEdgeTriangle>
        {!Array.isArray(props)
          ? undefined
          : props.map((prop, i) => (
              <DeterminePropEditorForKeyframeTree
                key={i}
                {...prop}
                // Don't autofocus the value — leave the popover ready for scrub
                // or a deliberate click-to-type on the value.
                indent={0}
              />
            ))}
      </KeyframeInlineEditorPopover>
    ),
  )

  const releaseIfActive = useCallback((close: CloseFn) => {
    if (openKeyframeInlineEditorPopoverClose === close) {
      openKeyframeInlineEditorPopoverClose = null
    }
  }, [])

  const close = useCallback<CloseFn>(
    (reason) => {
      releaseIfActive(close)
      popover.close(reason)
    },
    [popover.close, releaseIfActive],
  )

  const open = useCallback<OpenFn>(
    (e, target) => {
      closeOpenKeyframeInlineEditorPopover(
        'replaced by another keyframe inline editor',
      )
      popover.open(e, resolveKeyframePopoverTarget(e, target))
      openKeyframeInlineEditorPopoverClose = close
    },
    [popover.open, close],
  )

  const toggle = useCallback<OpenFn>(
    (e, target) => {
      if (popover.isOpen) {
        close('toggled')
      } else {
        closeOpenKeyframeInlineEditorPopover(
          'replaced by another keyframe inline editor',
        )
        popover.open(e, resolveKeyframePopoverTarget(e, target))
        openKeyframeInlineEditorPopoverClose = close
      }
    },
    [popover.isOpen, popover.open, close],
  )

  useEffect(() => {
    if (!popover.isOpen) {
      releaseIfActive(close)
    }
  }, [popover.isOpen, close, releaseIfActive])

  useEffect(() => {
    return () => {
      releaseIfActive(close)
    }
  }, [close, releaseIfActive])

  return {...popover, open, toggle, close}
}

export type EditingOptionsTree =
  | SheetObjectEditingOptionsTree
  | PropWithChildrenEditingOptionsTree
  | PrimitivePropEditingOptions
export type SheetObjectEditingOptionsTree = {
  type: 'sheetObject'
  sheetObject: SheetObject
  children: EditingOptionsTree[]
}
export type PropWithChildrenEditingOptionsTree = {
  type: 'propWithChildren'
  propConfig: PropTypeConfig_Compound<UnknownValidCompoundProps>
  pathToProp: PathToProp
  children: EditingOptionsTree[]
}
export type PrimitivePropEditingOptions = {
  type: 'primitiveProp'
  keyframe: Keyframe
  propConfig: PropTypeConfig_AllSimples | PropTypeConfig_Enum // note: enums are not implemented yet
  sheetObject: SheetObject
  trackId: SequenceTrackId
  pathToProp: PathToProp
}
