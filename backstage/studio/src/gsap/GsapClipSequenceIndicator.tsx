import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import React from 'react'
import styled from 'styled-components'
import {transparentize} from 'polished'
import SavedStateDiamondWrapper from '@unseenco/backstage/studio/propEditors/SavedStateDiamondWrapper'
import {nextPrevCursorsTheme} from '@unseenco/backstage/studio/propEditors/NextPrevKeyframeCursors'
import {addGsapClipAtPlayhead} from './addGsapClipAtPlayhead'
import {isGsapSheetObjectKey} from '@unseenco/backstage-shared/sequence/trackData'
import {isGsapScrollTriggerSheetObjectKey} from '@unseenco/backstage-shared/gsap/gsapSheetObjectKey'
import {usePrism} from '@unseenco/backstage/react'
import {val} from '@unseenco/backstage/dataverse'
import {gsapStudioRegistryRevisionPointer} from '@unseenco/backstage-shared/gsap/gsapStudioRegistryRevision'
import {
  readGsapClipIsOnSequence,
  removeGsapClipFromSequence,
} from './removeGsapClipFromSequence'

const Container = styled.div`
  width: 16px;
  margin: 0 0 0 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  line-height: 0;
  color: ${transparentize(0.8, `#C4C4C4`)};

  &:hover {
    color: ${transparentize(0.15, nextPrevCursorsTheme.onColor)};
  }
`

const GsapClipSequenceIndicator: React.FC<{sheetObject: SheetObject}> = ({
  sheetObject,
}) => {
  const onSequence = usePrism(() => {
    if (!isGsapSheetObjectKey(sheetObject.address.objectKey)) return false
    val(gsapStudioRegistryRevisionPointer)
    val(
      sheetObject.template.project.pointers.historic.sheetsById[
        sheetObject.address.sheetId
      ],
    )
    return readGsapClipIsOnSequence(sheetObject)
  }, [sheetObject])

  if (!isGsapSheetObjectKey(sheetObject.address.objectKey)) return null

  if (isGsapScrollTriggerSheetObjectKey(sheetObject.address.objectKey)) {
    return null
  }

  const addTitle = 'Add GSAP clip at playhead'
  const removeTitle = 'Remove this GSAP animation from the sequence'

  return (
    <Container
      title={onSequence ? removeTitle : addTitle}
      onClick={() => {
        if (onSequence) {
          removeGsapClipFromSequence(sheetObject)
        } else {
          addGsapClipAtPlayhead(sheetObject)
        }
      }}
    >
      <SavedStateDiamondWrapper
        hasDivergedFromSavedState={false}
        layout={onSequence ? 'sequenced' : 'static'}
        variant="filled"
        title={
          onSequence
            ? removeTitle
            : 'Add this GSAP animation to the sequence at the playhead'
        }
      />
    </Container>
  )
}

export default GsapClipSequenceIndicator
