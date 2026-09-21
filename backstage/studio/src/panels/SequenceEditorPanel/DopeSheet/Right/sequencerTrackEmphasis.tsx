import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import {usePrism} from '@unseenco/backstage/react'
import {isSheet, isProject} from '@unseenco/backstage-shared/instanceTypes'
import React, {createContext, useContext} from 'react'
import styled from 'styled-components'
import {getOutlineSelection} from '@unseenco/backstage/studio/selectors'
import type {Pointer} from '@unseenco/backstage/dataverse'
import type {
  DopeSheetSelection,
  SequenceEditorPanelLayout,
} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import type {
  SequenceEditorTree_AllRowTypes,
  SequenceEditorTree_Row,
} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/tree'
import {
  dopeSheetSelectionHasAnyKeyframes,
  getDopeSheetSelectionFromLayoutP,
  objectHasDopeSheetKeyframeSelection,
  outlineSelectedSheetObjects,
} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/dopeSheetSelectionHighlight'
import {sequencerTrackEmphasisCssVariables} from './sequencerTrackColors'
import type {SequencerTrackEmphasis} from './sequencerTrackColors'

export type {SequencerTrackEmphasis}

const SequencerTrackEmphasisContext =
  createContext<SequencerTrackEmphasis>('emphasized')

export function useSequencerTrackEmphasis(): SequencerTrackEmphasis {
  return useContext(SequencerTrackEmphasisContext)
}

function emphasisWhenNoTargetSheetObject(
  dopeSheetSelection: DopeSheetSelection | undefined,
): SequencerTrackEmphasis {
  const hasDopeSelection = dopeSheetSelectionHasAnyKeyframes(dopeSheetSelection)
  const outlineObjects = outlineSelectedSheetObjects()
  const outlineSelection = getOutlineSelection()
  const hasContainerOutlineSelection =
    outlineSelection.some(isSheet) || outlineSelection.some(isProject)
  if (
    outlineObjects.length === 0 &&
    !hasContainerOutlineSelection &&
    !hasDopeSelection
  ) {
    return 'emphasized'
  }
  return 'deemphasized'
}

export function getSequencerTrackEmphasisForSheetObject(
  sheetObject: SheetObject | undefined,
  dopeSheetSelection: DopeSheetSelection | undefined,
): SequencerTrackEmphasis {
  if (!sheetObject) {
    return emphasisWhenNoTargetSheetObject(dopeSheetSelection)
  }

  const objectKey = sheetObject.address.objectKey
  const hasDopeKeyframes = objectHasDopeSheetKeyframeSelection(
    objectKey,
    dopeSheetSelection,
  )

  const outlineSelection = getOutlineSelection()
  const outlineObjects = outlineSelectedSheetObjects()
  const hasContainerOutlineSelection =
    outlineSelection.some(isSheet) || outlineSelection.some(isProject)

  const isHighlighted = outlineObjects.includes(sheetObject) || hasDopeKeyframes

  const hasDopeSelection = dopeSheetSelectionHasAnyKeyframes(dopeSheetSelection)

  if (outlineObjects.length === 0 && !hasContainerOutlineSelection) {
    if (!hasDopeSelection) {
      return 'emphasized'
    }
    return hasDopeKeyframes ? 'emphasized' : 'deemphasized'
  }

  if (hasContainerOutlineSelection && outlineObjects.length === 0) {
    if (hasDopeKeyframes) {
      return 'emphasized'
    }
    return 'deemphasized'
  }

  return isHighlighted ? 'emphasized' : 'deemphasized'
}

function collectSheetObjectsInSequenceEditorRowSubtree(
  leaf: SequenceEditorTree_AllRowTypes,
): SheetObject[] {
  if (leaf.type === 'sheetObject') {
    return [leaf.sheetObject]
  }
  if (leaf.type === 'objectNamespace' || leaf.type === 'sheet') {
    return leaf.children.flatMap(collectSheetObjectsInSequenceEditorRowSubtree)
  }
  return []
}

function rowHasBoundSheetObject(
  leaf: SequenceEditorTree_AllRowTypes,
): leaf is Extract<SequenceEditorTree_AllRowTypes, {sheetObject: SheetObject}> {
  return 'sheetObject' in leaf && leaf.type !== 'sheetObject'
}

export function getSequencerTrackEmphasisForRow(
  leaf: SequenceEditorTree_AllRowTypes,
  dopeSheetSelection: DopeSheetSelection | undefined,
): SequencerTrackEmphasis {
  if (leaf.type === 'sheetObject') {
    return getSequencerTrackEmphasisForSheetObject(
      leaf.sheetObject,
      dopeSheetSelection,
    )
  }
  if (rowHasBoundSheetObject(leaf)) {
    return getSequencerTrackEmphasisForSheetObject(
      leaf.sheetObject,
      dopeSheetSelection,
    )
  }

  const descendantSheetObjects =
    collectSheetObjectsInSequenceEditorRowSubtree(leaf)
  if (descendantSheetObjects.length === 0) {
    return getSequencerTrackEmphasisForSheetObject(undefined, dopeSheetSelection)
  }

  const descendantEmphasis = descendantSheetObjects.map((sheetObject) =>
    getSequencerTrackEmphasisForSheetObject(
      sheetObject,
      dopeSheetSelection,
    ),
  )
  return descendantEmphasis.some((emphasis) => emphasis === 'emphasized')
    ? 'emphasized'
    : 'deemphasized'
}

export function useSequencerTrackEmphasisForRow(
  leaf: SequenceEditorTree_AllRowTypes | SequenceEditorTree_Row<string>,
  layoutP: Pointer<SequenceEditorPanelLayout>,
): SequencerTrackEmphasis {
  return usePrism(() => {
    const dopeSheetSelection = getDopeSheetSelectionFromLayoutP(layoutP)
    return getSequencerTrackEmphasisForRow(
      leaf as SequenceEditorTree_AllRowTypes,
      dopeSheetSelection,
    )
  }, [leaf, layoutP])
}

export function useSequencerTrackEmphasisForSheetObject(
  sheetObject: SheetObject | undefined,
  layoutP: Pointer<SequenceEditorPanelLayout>,
): SequencerTrackEmphasis {
  return usePrism(() => {
    const dopeSheetSelection = getDopeSheetSelectionFromLayoutP(layoutP)
    return getSequencerTrackEmphasisForSheetObject(
      sheetObject,
      dopeSheetSelection,
    )
  }, [sheetObject, layoutP])
}

export function SequencerTrackEmphasisProvider(props: {
  leaf: SequenceEditorTree_AllRowTypes | SequenceEditorTree_Row<string>
  layoutP: Pointer<SequenceEditorPanelLayout>
  children: React.ReactNode
}) {
  const emphasis = useSequencerTrackEmphasisForRow(props.leaf, props.layoutP)
  return (
    <SequencerTrackEmphasisContext.Provider value={emphasis}>
      {props.children}
    </SequencerTrackEmphasisContext.Provider>
  )
}

export const SequencerTrackVisuals = styled.div<{
  $emphasis: SequencerTrackEmphasis
}>`
  position: relative;
  width: 100%;
  height: 100%;
  ${(props) => sequencerTrackEmphasisCssVariables(props.$emphasis)}
`
