import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import {usePrism} from '@unseenco/backstage/react'
import {isSheetObject} from '@unseenco/backstage-shared/instanceTypes'
import React, {createContext, useContext} from 'react'
import styled, {css} from 'styled-components'
import {getOutlineSelection} from '@unseenco/backstage/studio/selectors'

export type SequencerTrackEmphasis = 'emphasized' | 'deemphasized'

const SequencerTrackEmphasisContext =
  createContext<SequencerTrackEmphasis>('emphasized')

export function useSequencerTrackEmphasis(): SequencerTrackEmphasis {
  return useContext(SequencerTrackEmphasisContext)
}

export function getSequencerTrackEmphasisForSheetObject(
  sheetObject: SheetObject | undefined,
): SequencerTrackEmphasis {
  if (!sheetObject) {
    return 'emphasized'
  }
  const selectedObjects = getOutlineSelection().filter(isSheetObject)
  if (selectedObjects.length === 0) {
    return 'emphasized'
  }
  return selectedObjects.includes(sheetObject) ? 'emphasized' : 'deemphasized'
}

export function useSequencerTrackEmphasisForSheetObject(
  sheetObject: SheetObject | undefined,
): SequencerTrackEmphasis {
  return usePrism(
    () => getSequencerTrackEmphasisForSheetObject(sheetObject),
    [sheetObject],
  )
}

export function SequencerTrackEmphasisProvider(props: {
  sheetObject: SheetObject | undefined
  children: React.ReactNode
}) {
  const emphasis = useSequencerTrackEmphasisForSheetObject(props.sheetObject)
  return (
    <SequencerTrackEmphasisContext.Provider value={emphasis}>
      {props.children}
    </SequencerTrackEmphasisContext.Provider>
  )
}

export const sequencerDeemphasizedTrackVisuals = css`
  filter: saturate(0.28) brightness(0.82);
  opacity: 0.62;
`

export const SequencerTrackVisuals = styled.div<{
  $emphasis: SequencerTrackEmphasis
}>`
  position: relative;
  width: 100%;
  height: 100%;
  ${(props) =>
    props.$emphasis === 'deemphasized' && sequencerDeemphasizedTrackVisuals};
`
