import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import {usePrism} from '@unseenco/backstage/react'
import {isSheet, isProject} from '@unseenco/backstage-shared/instanceTypes'
import React, {createContext, useContext} from 'react'
import styled from 'styled-components'
import {getOutlineSelection} from '@unseenco/backstage/studio/selectors'
import type {Pointer} from '@unseenco/backstage/dataverse'
import type {SequenceEditorPanelLayout} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import type {DopeSheetSelection} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
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

export function getSequencerTrackEmphasisForSheetObject(
  sheetObject: SheetObject | undefined,
  dopeSheetSelection: DopeSheetSelection | undefined,
): SequencerTrackEmphasis {
  if (!sheetObject) {
    return 'emphasized'
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
  sheetObject: SheetObject | undefined
  layoutP: Pointer<SequenceEditorPanelLayout>
  children: React.ReactNode
}) {
  const emphasis = useSequencerTrackEmphasisForSheetObject(
    props.sheetObject,
    props.layoutP,
  )
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
