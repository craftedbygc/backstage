import type {SequenceEditorPanelLayout} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import type {
  SequenceEditorTree_GsapScrollTriggerChild,
  SequenceEditorTree_GsapScrollTriggerTrack,
} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@unseenco/backstage/react'
import type {Pointer} from '@unseenco/backstage/dataverse'
import {val} from '@unseenco/backstage/dataverse'
import React from 'react'
import styled from 'styled-components'
import RightRow from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/Right/Row'
import {gsapClipBarLayoutInScaledSpace} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/Right/GsapClipTrack/gsapClipBarLayout'
import {pointerEventsAutoInNormalMode} from '@unseenco/backstage/studio/css'
import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import {selectSheetObjectInOutline} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/selectSheetObjectInOutline'

const Container = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`

const ScrollTriggerBar = styled.div<{$variant: 'parent' | 'child'}>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: ${(p) => (p.$variant === 'parent' ? '14px' : '10px')};
  border-radius: 3px;
  background: ${(p) =>
    p.$variant === 'parent'
      ? 'var(--sequencer-st-parent-bg, #4a5a8f)'
      : 'var(--sequencer-st-child-bg, #3d4d72)'};
  border: 1px solid
    ${(p) =>
      p.$variant === 'parent'
        ? 'var(--sequencer-st-parent-border, #7a8fc4)'
        : 'var(--sequencer-st-child-border, #5a6a94)'};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  ${pointerEventsAutoInNormalMode};
`

const BarLabel = styled.span`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.85);
  user-select: none;
  padding: 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`

const ReadOnlyBar: React.VFC<{
  layout: {start: number; duration: number}
  layoutP: Pointer<SequenceEditorPanelLayout>
  label?: string
  variant: 'parent' | 'child'
  sheetObject: SheetObject
}> = ({layout, layoutP, label, variant, sheetObject}) => {
  const scaledSpace = usePrism(
    () => ({
      fromUnitSpace: val(layoutP.scaledSpace.fromUnitSpace),
      leftPadding: val(layoutP.scaledSpace.leftPadding),
    }),
    [layoutP],
  )
  const {leftPx, widthPx} = gsapClipBarLayoutInScaledSpace(layout, scaledSpace)

  return (
    <Container>
      <ScrollTriggerBar
        $variant={variant}
        style={{left: leftPx + 'px', width: widthPx + 'px'}}
        onClick={() => {
          selectSheetObjectInOutline(sheetObject)
        }}
        role="button"
        tabIndex={-1}
      >
        {label ? <BarLabel>{label}</BarLabel> : null}
      </ScrollTriggerBar>
    </Container>
  )
}

export const GsapScrollTriggerTrackBarForTreeLeaf: React.VFC<{
  leaf: SequenceEditorTree_GsapScrollTriggerTrack
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => (
  <ReadOnlyBar
    layout={leaf.layout}
    layoutP={layoutP}
    label={leaf.displayLabel}
    variant="parent"
    sheetObject={leaf.sheetObject}
  />
)

const GsapScrollTriggerTrackRow: React.VFC<{
  leaf: SequenceEditorTree_GsapScrollTriggerTrack
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => {
  return usePrism(() => {
    const node = (
      <GsapScrollTriggerTrackBarForTreeLeaf leaf={leaf} layoutP={layoutP} />
    )
    return (
      <RightRow
        layoutP={layoutP}
        leaf={leaf}
        isCollapsed={leaf.isCollapsed}
        node={node}
      >
        {leaf.children.map((child) => (
          <GsapScrollTriggerChildTrackRow
            key={child.childId}
            leaf={child}
            layoutP={layoutP}
          />
        ))}
      </RightRow>
    )
  }, [leaf, layoutP])
}

const GsapScrollTriggerChildTrackRow: React.VFC<{
  leaf: SequenceEditorTree_GsapScrollTriggerChild
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => {
  return usePrism(() => {
    const node = (
      <ReadOnlyBar
        layout={leaf.layout}
        layoutP={layoutP}
        label={leaf.displayLabel}
        variant="child"
        sheetObject={leaf.sheetObject}
      />
    )
    return (
      <RightRow layoutP={layoutP} leaf={leaf} isCollapsed={false} node={node} />
    )
  }, [leaf, layoutP])
}

export {GsapScrollTriggerChildTrackRow}

export default GsapScrollTriggerTrackRow
