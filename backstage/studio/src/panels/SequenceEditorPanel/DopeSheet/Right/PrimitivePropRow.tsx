import type {SequenceEditorPanelLayout} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_PrimitiveProp} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/tree'
import {getSequenceStateFromSheet} from '@unseenco/backstage/studio/utils/sequenceVariantHelpers'
import getStudio from '@unseenco/backstage/studio/getStudio'
import {getStudioActiveSequenceVariant} from '@unseenco/backstage/studio/utils/activeSequenceVariant'
import {usePrism} from '@unseenco/backstage/react'
import type {Pointer} from '@unseenco/backstage/dataverse'
import {val} from '@unseenco/backstage/dataverse'
import React from 'react'
import RightRow from './Row'
import BasicKeyframedTrack from './BasicKeyframedTrack/BasicKeyframedTrack'
import {useLogger} from '@unseenco/backstage/studio/uiComponents/useLogger'

const PrimitivePropRow: React.VFC<{
  leaf: SequenceEditorTree_PrimitiveProp
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({leaf, layoutP}) => {
  const logger = useLogger('PrimitivePropRow', leaf.pathToProp.join())
  return usePrism(() => {
    const {sheetObject} = leaf
    const {trackId} = leaf

    const sheetState = val(
      getStudio()!.atomP.historic.coreByProject[sheetObject.address.projectId]
        .sheetsById[sheetObject.address.sheetId],
    )
    const activeVariant = getStudioActiveSequenceVariant(
      sheetObject.sheet.address,
    )
    const trackVariant =
      sheetObject.template.getSequenceVariantOwningTrack(
        trackId,
        activeVariant,
      ) ?? activeVariant
    const trackData = getSequenceStateFromSheet(sheetState, trackVariant)
      ?.tracksByObject[sheetObject.address.objectKey]?.trackData[trackId]

    if (trackData?.type !== 'BasicKeyframedTrack') {
      logger.errorDev(
        `trackData type ${trackData?.type} is not yet supported on the sequence editor`,
      )
      return (
        <RightRow
          layoutP={layoutP}
          leaf={leaf}
          isCollapsed={false}
          node={<div />}
        ></RightRow>
      )
    } else {
      const node = (
        <BasicKeyframedTrack
          layoutP={layoutP}
          trackData={trackData}
          leaf={leaf}
        />
      )

      return (
        <RightRow
          layoutP={layoutP}
          leaf={leaf}
          isCollapsed={false}
          node={node}
        ></RightRow>
      )
    }
  }, [leaf, layoutP])
}

export default PrimitivePropRow
