import type {
  DopeSheetSelection,
  SequenceEditorPanelLayout,
} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/layout'
import type {
  SequenceEditorTree_ObjectNamespace,
  SequenceEditorTree_PropWithChildren,
  SequenceEditorTree_Sheet,
  SequenceEditorTree_SheetObject,
} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import {collectSheetObjectsFromSheetChildren} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import {isSequenceEditorSheetScopedAggregateViewModel} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/sequenceEditorAggregateViewModel'
import {usePrism, useVal} from '@unseenco/backstage/react'
import type {Prism, Pointer} from '@unseenco/theatre-dataverse'
import {prism, val, pointerToPrism} from '@unseenco/theatre-dataverse'
import React, {useMemo} from 'react'
import styled from 'styled-components'
import type {IContextMenuItem} from '@unseenco/theatre-studio/uiComponents/simpleContextMenu/useContextMenu'
import useContextMenu from '@unseenco/theatre-studio/uiComponents/simpleContextMenu/useContextMenu'
import useRefAndState from '@unseenco/theatre-studio/utils/useRefAndState'
import type {
  AggregatedKeyframes,
  KeyframeWithTrack,
} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import {
  collectAggregateSnapPositionsObjectNamespace,
  collectAggregateSnapPositionsObjectOrCompound,
  collectAggregateSnapPositionsSheet,
} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import {useLogger} from '@unseenco/theatre-studio/uiComponents/useLogger'
import {
  getStudioActiveSequenceVariant,
  getStudioSequence,
  pointerToActiveSheetSequence,
} from '@unseenco/theatre-studio/utils/activeSequenceVariant'
import getStudio from '@unseenco/theatre-studio/getStudio'
import type {SheetObjectAddress} from '@unseenco/backstage-shared/utils/addresses'
import {
  decodePathToProp,
  doesPathStartWith,
  encodePathToProp,
} from '@unseenco/backstage-shared/utils/addresses'
import type {
  ObjectAddressKey,
  SequenceTrackId,
} from '@unseenco/backstage-shared/utils/ids'
import type Sequence from '@unseenco/theatre-core/sequences/Sequence'
import KeyframeSnapTarget, {
  snapPositionsStateD,
} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/DopeSheet/Right/KeyframeSnapTarget'
import {emptyObject} from '@unseenco/backstage-shared/utils'
import type {KeyframeWithPathToPropFromCommonRoot} from '@unseenco/theatre-studio/store/types'
import type {Keyframe} from '@unseenco/theatre-core/projects/store/types/SheetState_Historic'
import AggregateKeyframeSpanBar from './AggregateKeyframeSpanBar'

const AggregatedKeyframeTrackContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`

type IAggregatedKeyframeTracksProps = {
  viewModel:
    | SequenceEditorTree_PropWithChildren
    | SequenceEditorTree_SheetObject
    | SequenceEditorTree_ObjectNamespace
    | SequenceEditorTree_Sheet
  aggregatedKeyframes: AggregatedKeyframes
  layoutP: Pointer<SequenceEditorPanelLayout>
}

type _AggSelection = {
  selectedPositions: Map<number, AggregateKeyframePositionIsSelected>
  selection: DopeSheetSelection | undefined
}

const EMPTY_SELECTION: _AggSelection = Object.freeze({
  selectedPositions: new Map(),
  selection: undefined,
})

function AggregatedKeyframeTrack_memo(props: IAggregatedKeyframeTracksProps) {
  const {layoutP, aggregatedKeyframes, viewModel} = props
  const logger = useLogger('AggregatedKeyframeTrack')
  const [containerRef, containerNode] = useRefAndState<HTMLDivElement | null>(
    null,
  )

  const [contextMenu, _, isOpen] = useAggregatedKeyframeTrackContextMenu(
    containerNode,
    props,
    () => logger._debug('see aggregatedKeyframes', props.aggregatedKeyframes),
  )

  const snapPositionsState = useVal(snapPositionsStateD)

  const snapToAllKeyframes = snapPositionsState.mode === 'snapToAll'

  const snapPositions =
    snapPositionsState.mode === 'snapToSome'
      ? snapPositionsState.positions
      : emptyObject

  const aggregateSnapPositions = useMemo(
    () =>
      viewModel.type === 'sheet'
        ? collectAggregateSnapPositionsSheet(viewModel, snapPositions)
        : viewModel.type === 'objectNamespace'
        ? collectAggregateSnapPositionsObjectNamespace(viewModel, snapPositions)
        : collectAggregateSnapPositionsObjectOrCompound(
            viewModel,
            snapPositions,
          ),
    [snapPositions, viewModel],
  )

  const snapTargets = aggregateSnapPositions.map((position) => (
    <KeyframeSnapTarget
      key={'snap-target-' + position}
      layoutP={layoutP}
      leaf={viewModel}
      position={position}
    />
  ))

  const snapToAllTargets = snapToAllKeyframes
    ? [...aggregatedKeyframes.byPosition.keys()].map((position) => (
        <KeyframeSnapTarget
          key={'snap-target-all-' + position}
          layoutP={layoutP}
          leaf={viewModel}
          position={position}
        />
      ))
    : null

  return (
    <AggregatedKeyframeTrackContainer
      ref={containerRef}
      style={{
        background: isOpen ? '#444850 ' : 'unset',
      }}
    >
      <AggregateKeyframeSpanBar
        viewModel={viewModel}
        aggregatedKeyframes={aggregatedKeyframes}
        layoutP={layoutP}
      />
      {snapToAllTargets}
      {snapTargets}
      {contextMenu}
    </AggregatedKeyframeTrackContainer>
  )
}

const AggregatedKeyframeTrack = React.memo(AggregatedKeyframeTrack_memo)
export default AggregatedKeyframeTrack

export enum AggregateKeyframePositionIsSelected {
  AllSelected,
  AtLeastOneUnselected,
  NoneSelected,
}

const {AllSelected, AtLeastOneUnselected, NoneSelected} =
  AggregateKeyframePositionIsSelected

/** Helper to put together the selected positions */
function useCollectedSelectedPositions(
  layoutP: Pointer<SequenceEditorPanelLayout>,
  aggregatedKeyframes: AggregatedKeyframes,
): _AggSelection {
  return usePrism(
    () => val(collectedSelectedPositions(layoutP, aggregatedKeyframes)),
    [layoutP, aggregatedKeyframes],
  )
}

function collectedSelectedPositions(
  layoutP: Pointer<SequenceEditorPanelLayout>,
  aggregatedKeyframes: AggregatedKeyframes,
): Prism<_AggSelection> {
  return prism(() => {
    const selectionAtom = val(layoutP.selectionAtom)
    const selection = val(selectionAtom.pointer.current)
    if (!selection) return EMPTY_SELECTION

    const selectedAtPositions = new Map<
      number,
      AggregateKeyframePositionIsSelected
    >()

    for (const [position, kfsWithTrack] of aggregatedKeyframes.byPosition) {
      const positionIsSelected = allOrSomeOrNoneSelected(
        kfsWithTrack,
        selection,
      )
      if (
        positionIsSelected !== undefined &&
        positionIsSelected !== NoneSelected
      ) {
        selectedAtPositions.set(position, positionIsSelected)
      }
    }

    return {
      selectedPositions: selectedAtPositions,
      selection: val(selectionAtom.pointer.current),
    }
  })
}

function allOrSomeOrNoneSelected(
  keyframeWithTracks: KeyframeWithTrack[],
  selection: DopeSheetSelection,
): AggregateKeyframePositionIsSelected | undefined {
  let positionIsSelected: undefined | AggregateKeyframePositionIsSelected =
    undefined

  for (const {track, kf} of keyframeWithTracks) {
    const kfIsSelected =
      selection.byObjectKey[track.sheetObject.address.objectKey]?.byTrackId[
        track.id
      ]?.byKeyframeId?.[kf.id] === true
    if (positionIsSelected === undefined) {
      if (kfIsSelected) {
        positionIsSelected = AllSelected
      } else {
        positionIsSelected = NoneSelected
      }
    } else if (kfIsSelected) {
      if (positionIsSelected === NoneSelected) {
        positionIsSelected = AtLeastOneUnselected
      }
    } else {
      if (positionIsSelected === AllSelected) {
        positionIsSelected = AtLeastOneUnselected
      }
    }
  }
  return positionIsSelected
}

function useAggregatedKeyframeTrackContextMenu(
  node: HTMLDivElement | null,
  props: IAggregatedKeyframeTracksProps,
  debugOnOpen: () => void,
) {
  return useContextMenu(node, {
    onOpen: debugOnOpen,
    displayName: 'Aggregate Keyframe Track',
    menuItems: () => {
      const selectionKeyframes =
        pointerToPrism(
          getStudio()!.atomP.ahistoric.clipboard.keyframesWithRelativePaths,
        ).getValue() ?? []

      return [pasteKeyframesContextMenuItem(props, selectionKeyframes)]
    },
  })
}

function pasteKeyframesContextMenuItem(
  props: IAggregatedKeyframeTracksProps,
  keyframes: KeyframeWithPathToPropFromCommonRoot[],
): IContextMenuItem {
  return {
    type: 'normal',
    label: 'Paste Keyframes',
    enabled: keyframes.length > 0,
    callback: () => {
      const sheet = val(props.layoutP.sheet)
      const sequence = getStudioSequence(sheet)

      if (isSequenceEditorSheetScopedAggregateViewModel(props.viewModel)) {
        pasteKeyframesSheetScoped(props.viewModel, keyframes, sequence)
      } else {
        pasteKeyframesObjectOrCompound(props.viewModel, keyframes, sequence)
      }
    },
  }
}

/**
 * Given a list of keyframes that contain paths relative to a common root,
 * (see `copyableKeyframesFromSelection`) this function pastes those keyframes
 * into tracks on either the object (if viewModel.type === 'sheetObject') or
 * the compound prop (if viewModel.type === 'propWithChildren').
 *
 * Our copy & paste behavior is currently roughly described in AGGREGATE_COPY_PASTE.md
 *
 * @see StudioAhistoricState.clipboard
 * @see setClipboardNestedKeyframes
 */
function pasteKeyframesSheetScoped(
  viewModel: SequenceEditorTree_Sheet | SequenceEditorTree_ObjectNamespace,
  keyframes: KeyframeWithPathToPropFromCommonRoot[],
  sequence: Sequence,
) {
  const scopedRows = collectSheetObjectsFromSheetChildren(viewModel.children)
  const {projectId, sheetId, sheetInstanceId} =
    viewModel.type === 'sheet'
      ? viewModel.sheet.address
      : scopedRows[0]?.sheetObject.address ?? viewModel.sheetAddress

  const areKeyframesAllOnSingleTrack = keyframes.every(
    ({pathToProp}) => pathToProp.length === 0,
  )

  const sheetAddress = {projectId, sheetId}

  if (areKeyframesAllOnSingleTrack) {
    for (const row of scopedRows) {
      const object = row.sheetObject
      const tracksByObject = pointerToPrism(
        pointerToActiveSheetSequence(
          viewModel.type === 'sheet'
            ? viewModel.sheet.project
            : object.template.project,
          sheetId,
          sheetAddress,
        ).tracksByObject[object.address.objectKey],
      ).getValue()

      const trackIdsOnObject = Object.keys(tracksByObject?.trackData ?? {})

      pasteKeyframesToMultipleTracks(
        object.address,
        trackIdsOnObject,
        keyframes,
        sequence,
      )
    }
  } else {
    const project =
      viewModel.type === 'sheet'
        ? viewModel.sheet.project
        : scopedRows[0]!.sheetObject.template.project
    const tracksByObject = pointerToPrism(
      pointerToActiveSheetSequence(project, sheetId, sheetAddress)
        .tracksByObject,
    ).getValue()

    const placeableKeyframes = keyframes
      .map(({keyframe, pathToProp}) => {
        const objectKey = pathToProp[0] as ObjectAddressKey
        const relativePathToProp = pathToProp.slice(1)
        const pathToPropEncoded = encodePathToProp([...relativePathToProp])

        const trackIdByPropPath =
          tracksByObject?.[objectKey]?.trackIdByPropPath ?? {}

        const maybeTrackId = trackIdByPropPath[pathToPropEncoded]

        return maybeTrackId
          ? {
              keyframe,
              trackId: maybeTrackId,
              address: {
                objectKey,
                projectId,
                sheetId,
                sheetInstanceId,
              },
            }
          : null
      })
      .filter((result) => result !== null) as {
      keyframe: Keyframe
      trackId: SequenceTrackId
      address: SheetObjectAddress
    }[]

    pasteKeyframesToSpecificTracks(placeableKeyframes, sequence)
  }
}

function pasteKeyframesObjectOrCompound(
  viewModel:
    | SequenceEditorTree_PropWithChildren
    | SequenceEditorTree_SheetObject,
  keyframes: KeyframeWithPathToPropFromCommonRoot[],
  sequence: Sequence,
) {
  const {projectId, sheetId, objectKey} = viewModel.sheetObject.address
  const sheetAddress = {projectId, sheetId}

  const trackRecords = pointerToPrism(
    pointerToActiveSheetSequence(
      viewModel.sheetObject.template.project,
      sheetId,
      sheetAddress,
    ).tracksByObject[objectKey],
  ).getValue()

  const areKeyframesAllOnSingleTrack = keyframes.every(
    ({pathToProp}) => pathToProp.length === 0,
  )

  if (areKeyframesAllOnSingleTrack) {
    const trackIdsOnObject = Object.keys(trackRecords?.trackData ?? {})

    if (viewModel.type === 'sheetObject') {
      pasteKeyframesToMultipleTracks(
        viewModel.sheetObject.address,
        trackIdsOnObject,
        keyframes,
        sequence,
      )
    } else {
      const trackIdByPropPath = trackRecords?.trackIdByPropPath || {}

      const trackIdsOnCompoundProp = Object.entries(trackIdByPropPath)
        .filter(
          ([encodedPath, trackId]) =>
            trackId !== undefined &&
            doesPathStartWith(
              // e.g. a track with path `['position', 'x']` is under the compound track with path `['position']`
              decodePathToProp(encodedPath),
              viewModel.pathToProp,
            ),
        )
        .map(([encodedPath, trackId]) => trackId) as SequenceTrackId[]

      pasteKeyframesToMultipleTracks(
        viewModel.sheetObject.address,
        trackIdsOnCompoundProp,
        keyframes,
        sequence,
      )
    }
  } else {
    const trackIdByPropPath = trackRecords?.trackIdByPropPath || {}

    const rootPath =
      viewModel.type === 'propWithChildren' ? viewModel.pathToProp : []

    const placeableKeyframes = keyframes
      .map(({keyframe, pathToProp: relativePathToProp}) => {
        const pathToPropEncoded = encodePathToProp([
          ...rootPath,
          ...relativePathToProp,
        ])

        const maybeTrackId = trackIdByPropPath[pathToPropEncoded]

        return maybeTrackId
          ? {
              keyframe,
              trackId: maybeTrackId,
              address: viewModel.sheetObject.address,
            }
          : null
      })
      .filter((result) => result !== null) as {
      keyframe: Keyframe
      trackId: SequenceTrackId
      address: SheetObjectAddress
    }[]

    pasteKeyframesToSpecificTracks(placeableKeyframes, sequence)
  }
}

function pasteKeyframesToMultipleTracks(
  address: SheetObjectAddress,
  trackIds: SequenceTrackId[],
  keyframes: KeyframeWithPathToPropFromCommonRoot[],
  sequence: Sequence,
) {
  sequence.position = sequence.closestGridPosition(sequence.position)
  const keyframeOffset = earliestKeyframe(
    keyframes.map(({keyframe}) => keyframe),
  )?.position!

  const sequenceVariant = getStudioActiveSequenceVariant({
    projectId: address.projectId,
    sheetId: address.sheetId,
  })

  getStudio()!.transaction(({stateEditors}) => {
    for (const trackId of trackIds) {
      for (const {keyframe} of keyframes) {
        stateEditors.coreByProject.historic.sheetsById.sequence.setKeyframeAtPosition(
          {
            ...address,
            trackId,
            position: sequence.position + keyframe.position - keyframeOffset,
            handles: keyframe.handles,
            value: keyframe.value,
            snappingFunction: sequence.closestGridPosition,
            type: keyframe.type,
            sequenceVariant,
          },
        )
      }
    }
  })
}

function pasteKeyframesToSpecificTracks(
  keyframesWithTracksToPlaceThemIn: {
    keyframe: Keyframe
    trackId: SequenceTrackId
    address: SheetObjectAddress
  }[],
  sequence: Sequence,
) {
  sequence.position = sequence.closestGridPosition(sequence.position)
  const keyframeOffset = earliestKeyframe(
    keyframesWithTracksToPlaceThemIn.map(({keyframe}) => keyframe),
  )?.position!

  const sequenceVariant = getStudioActiveSequenceVariant({
    projectId: keyframesWithTracksToPlaceThemIn[0].address.projectId,
    sheetId: keyframesWithTracksToPlaceThemIn[0].address.sheetId,
  })

  getStudio()!.transaction(({stateEditors}) => {
    for (const {
      keyframe,
      trackId,
      address,
    } of keyframesWithTracksToPlaceThemIn) {
      stateEditors.coreByProject.historic.sheetsById.sequence.setKeyframeAtPosition(
        {
          ...address,
          trackId,
          position: sequence.position + keyframe.position - keyframeOffset,
          handles: keyframe.handles,
          value: keyframe.value,
          snappingFunction: sequence.closestGridPosition,
          type: keyframe.type,
          sequenceVariant,
        },
      )
    }
  })
}

function earliestKeyframe(keyframes: Keyframe[]) {
  let curEarliest: Keyframe | null = null
  for (const keyframe of keyframes) {
    if (curEarliest === null || keyframe.position < curEarliest.position) {
      curEarliest = keyframe
    }
  }
  return curEarliest
}
