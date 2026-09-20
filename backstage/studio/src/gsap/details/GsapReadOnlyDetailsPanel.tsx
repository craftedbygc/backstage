import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import {getAnimationEntryForSheetObject} from '@unseenco/backstage-shared/gsap/gsapAnimationRegistry'
import {gsapStudioRegistryRevisionPointer} from '@unseenco/backstage-shared/gsap/gsapStudioRegistryRevision'
import {introspectGsapAnimationDetails} from '@unseenco/backstage-shared/gsap/introspectGsapTweenDetails'
import {
  getScrollTriggerEntryForSheetObject,
  introspectScrollTriggerDetails,
} from '@unseenco/backstage-shared/gsap/introspectScrollTriggerDetails'
import {
  isGsapScrollTriggerSheetObjectKey,
  isGsapSheetObjectKey,
} from '@unseenco/backstage-shared/gsap/gsapSheetObjectKey'
import {usePrism} from '@unseenco/backstage/react'
import {val} from '@unseenco/backstage/dataverse'
import React from 'react'
import styled from 'styled-components'
import GsapInlineTargetRow from './GsapInlineTargetRow'
import GsapTweenBlockSection from './GsapTweenBlockSection'
import GsapVarsList from './GsapVarsList'

const Message = styled.p`
  margin: 10px 8px;
  font-size: 11px;
  color: #888;
`

const Section = styled.fieldset`
  margin: 10px 6px 6px;
  padding: 4px 0 6px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: var(--studio-radius);
  min-width: 0;
`

const Legend = styled.legend`
  margin-left: 8px;
  padding: 0 6px;
  font-size: 10px;
  color: #a9a9a9;
`

const SubHeading = styled.div`
  padding: 4px 8px 2px;
  font-size: 10px;
  color: #8a8a8a;
`

const GsapScrollTriggerDetailsView: React.VFC<{
  sheetObject: SheetObject
}> = ({sheetObject}) => {
  const details = usePrism(() => {
    val(gsapStudioRegistryRevisionPointer)
    val(
      sheetObject.template.project.pointers.historic.sheetsById[
        sheetObject.address.sheetId
      ],
    )
    const entry = getScrollTriggerEntryForSheetObject(sheetObject)
    if (!entry) return null
    return introspectScrollTriggerDetails(entry)
  }, [sheetObject])

  if (!details) {
    return (
      <Message>
        No ScrollTrigger registry entry for this object. Register it with
        backstage-gsap first.
      </Message>
    )
  }

  return (
    <>
      <Section>
        <Legend>{details.label}</Legend>
        <GsapInlineTargetRow label="trigger" targets={details.triggerTargets} />
        <SubHeading>vars</SubHeading>
        <GsapVarsList rows={details.vars} />
      </Section>
      {details.linkedAnimationBlocks.map((block) => (
        <GsapTweenBlockSection key={block.name} block={block} />
      ))}
    </>
  )
}

const GsapAnimationDetailsView: React.VFC<{sheetObject: SheetObject}> = ({
  sheetObject,
}) => {
  const blocks = usePrism(() => {
    val(gsapStudioRegistryRevisionPointer)
    val(
      sheetObject.template.project.pointers.historic.sheetsById[
        sheetObject.address.sheetId
      ],
    )
    const entry = getAnimationEntryForSheetObject(sheetObject)
    if (!entry?.animation) return null
    return introspectGsapAnimationDetails(entry.animation, {
      registrationLabel: entry.label,
    }).blocks
  }, [sheetObject])

  if (!blocks) {
    return (
      <Message>
        No GSAP animation registry entry for this object. Register it with
        backstage-gsap first.
      </Message>
    )
  }

  return (
    <>
      {blocks.map((block) => (
        <GsapTweenBlockSection key={block.name} block={block} />
      ))}
    </>
  )
}

const GsapReadOnlyDetailsPanel: React.VFC<{sheetObject: SheetObject}> = ({
  sheetObject,
}) => {
  const objectKey = sheetObject.address.objectKey
  if (!isGsapSheetObjectKey(objectKey)) {
    return null
  }
  if (isGsapScrollTriggerSheetObjectKey(objectKey)) {
    return <GsapScrollTriggerDetailsView sheetObject={sheetObject} />
  }
  return <GsapAnimationDetailsView sheetObject={sheetObject} />
}

export default GsapReadOnlyDetailsPanel
