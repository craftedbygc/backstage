import React from 'react'
import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import type {Pointer} from '@unseenco/theatre-dataverse'
import type {$FixMe} from '@unseenco/backstage-shared/utils/types'
import DeterminePropEditorForDetail from './DeterminePropEditorForDetail'
import {useVal, usePrism} from '@unseenco/backstage/react'
import uniqueKeyForAnyObject from '@unseenco/backstage-shared/utils/uniqueKeyForAnyObject'
import styled from 'styled-components'
import getStudio from '@unseenco/theatre-studio/getStudio'
import {isGsapSheetObjectKey} from '@unseenco/backstage-shared/sequence/trackData'
import {isGsapScrollTriggerSheetObjectKey} from '@unseenco/backstage-shared/gsap/gsapSheetObjectKey'
import {getGsapStudioOutlineMenuItems} from '@unseenco/theatre-studio/gsap/gsapOutlineMenuItems'
import GsapReadOnlyDetailsPanel from '@unseenco/theatre-studio/gsap/details/GsapReadOnlyDetailsPanel'
import {gsapStudioRegistryRevisionPointer} from '@unseenco/backstage-shared/gsap/gsapStudioRegistryRevision'
import {val} from '@unseenco/theatre-dataverse'

const ActionButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
`

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border-radius: var(--studio-radius);

  color: #a8a8a9;
  background: rgba(255, 255, 255, 0.1);

  border: none;
  height: 28px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
`

const ShowPropsOfSection = styled.fieldset`
  margin: 10px 6px 6px;
  padding: 4px 0 6px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: var(--studio-radius);
  min-width: 0;
`

const ShowPropsOfLegend = styled.legend`
  margin-left: 8px;
  padding: 0 6px;
`

const ShowPropsOfLegendButton = styled.button`
  appearance: none;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  color: #a9a9a9;
  font: inherit;
  font-size: 10px;
  letter-spacing: 0.02em;
  text-transform: none;
  cursor: pointer;

  &:hover {
    color: var(--studio-text-focus);
  }
`

const ShowPropsOfObjectSection: React.FC<{source: SheetObject}> = ({
  source,
}) => {
  const sourceConfig = useVal(source.template.configPointer)

  // Skip detached sources (still held in the runtime list but no longer on the sheet).
  if (!source.sheet.getObject(source.address.objectKey)) {
    return null
  }

  const objectKey = source.address.objectKey

  return (
    <ShowPropsOfSection>
      <ShowPropsOfLegend>
        <ShowPropsOfLegendButton
          type="button"
          title={`Show ${objectKey} in the details pane`}
          onClick={() => {
            getStudio().transaction(({stateEditors}) => {
              stateEditors.studio.historic.panels.outline.selection.set([
                source,
              ])
            })
          }}
        >
          {objectKey}
        </ShowPropsOfLegendButton>
      </ShowPropsOfLegend>
      <DeterminePropEditorForDetail
        key={uniqueKeyForAnyObject(source)}
        obj={source}
        pointerToProp={source.propsP as Pointer<$FixMe>}
        propConfig={sourceConfig}
        visualIndentation={1}
        hideRootHeader
      />
    </ShowPropsOfSection>
  )
}

const ObjectDetails: React.FC<{
  /** TODO: add support for multiple objects (it would show their common props) */
  objects: [SheetObject]
}> = ({objects}) => {
  const obj = objects[0]
  const config = useVal(obj.template.configPointer)
  const actions = useVal(obj.template._temp_actionsPointer)
  const showPropsOf = useVal(obj.template.showPropsOfPointer)
  const gsapActions = usePrism(() => {
    if (!isGsapSheetObjectKey(obj.address.objectKey)) return []
    val(gsapStudioRegistryRevisionPointer)
    val(obj.template.project.pointers.historic.sheetsById[obj.address.sheetId])
    return getGsapStudioOutlineMenuItems(obj).map((item) => ({
      type: 'normal' as const,
      label:
        typeof item.label === 'string'
          ? item.label
          : 'Add to sequence at playhead',
      callback: () => {
        item.callback?.({} as React.MouseEvent)
      },
    }))
  }, [obj])

  const objectKey = obj.address.objectKey
  const isGsapProxy = isGsapSheetObjectKey(objectKey)
  const isGsapScrollTriggerProxy = isGsapScrollTriggerSheetObjectKey(objectKey)
  const showGsapReadOnlyDetails = isGsapProxy

  return (
    <>
      {showGsapReadOnlyDetails ? (
        <GsapReadOnlyDetailsPanel sheetObject={obj} />
      ) : (
        <DeterminePropEditorForDetail
          // we don't use the object's address as the key because if a user calls `sheet.detachObject(key)` and later
          // calls `sheet.object(key)` with the same key, we want to re-render the object details panel.
          key={uniqueKeyForAnyObject(obj)}
          obj={obj}
          pointerToProp={obj.propsP as Pointer<$FixMe>}
          propConfig={config}
          visualIndentation={1}
        />
      )}
      {showPropsOf.map((source) => (
        <ShowPropsOfObjectSection
          key={uniqueKeyForAnyObject(source)}
          source={source}
        />
      ))}
      {gsapActions.length > 0 && !isGsapScrollTriggerProxy ? (
        <ActionButtonContainer>
          {gsapActions.map((item) => (
            <ActionButton
              key={item.label}
              type="button"
              onClick={item.callback}
            >
              {item.label}
            </ActionButton>
          ))}
        </ActionButtonContainer>
      ) : null}
      {actions && Object.keys(actions).length > 0 ? (
        <ActionButtonContainer>
          {Object.entries(actions).map(([actionName, action]) => {
            return (
              <ActionButton
                key={actionName}
                onClick={() => {
                  action(obj.publicApi)
                }}
              >
                {actionName}
              </ActionButton>
            )
          })}
        </ActionButtonContainer>
      ) : null}
    </>
  )
}

export default ObjectDetails
