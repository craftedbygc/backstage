import type {
  IBasePropType,
  PropTypeConfig_AllSimples,
} from '@unseenco/backstage/propTypes'
import React, {useMemo} from 'react'
import {useEditingToolsForSimplePropInDetailsPanel} from '@unseenco/backstage/studio/propEditors/useEditingToolsForSimpleProp'
import {SingleRowPropEditor} from '@unseenco/backstage/studio/panels/DetailPanel/DeterminePropEditorForDetail/SingleRowPropEditor'
import type {Pointer} from '@unseenco/backstage/dataverse'
import {getPointerParts} from '@unseenco/backstage/dataverse'
import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import type {ISimplePropEditorReactProps} from '@unseenco/backstage/studio/propEditors/simpleEditors/ISimplePropEditorReactProps'
import {whatPropIsHighlighted} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/whatPropIsHighlighted'
import {sheetObjectPropsTooltipNamespace} from '@unseenco/backstage-shared/utils/sheetProps'

export type IDetailSimplePropEditorProps<
  TPropTypeConfig extends IBasePropType<string, any>,
> = {
  propConfig: TPropTypeConfig
  pointerToProp: Pointer<TPropTypeConfig['valueType']>
  obj: SheetObject
  visualIndentation: number
  SimpleEditorComponent: React.VFC<ISimplePropEditorReactProps<TPropTypeConfig>>
}

/**
 * Shown in the Object details panel, changes to this editor are usually reflected at either
 * the playhead position (the `sequence.position`) or if static, the static override value.
 */
function DetailSimplePropEditor<
  TPropTypeConfig extends PropTypeConfig_AllSimples,
>({
  propConfig,
  pointerToProp,
  obj,
  SimpleEditorComponent: EditorComponent,
}: IDetailSimplePropEditorProps<TPropTypeConfig>) {
  const editingTools = useEditingToolsForSimplePropInDetailsPanel(
    pointerToProp,
    obj,
    propConfig,
  )

  const isPropHighlightedD = useMemo(
    () =>
      whatPropIsHighlighted.getIsPropHighlightedD({
        ...obj.address,
        pathToProp: getPointerParts(pointerToProp).path,
      }),
    [pointerToProp],
  )

  const isTransient = obj.template.isTransientPropPath(
    getPointerParts(pointerToProp).path,
  )

  return (
    <SingleRowPropEditor
      {...{
        editingTools: editingTools,
        propConfig,
        pointerToProp,
        isPropHighlightedD,
        objectKey: sheetObjectPropsTooltipNamespace(
          obj.address.objectKey,
          obj.sheet.address.sheetId,
        ),
        isTransient,
      }}
    >
      <EditorComponent
        editingTools={editingTools}
        propConfig={propConfig}
        value={editingTools.value}
      />
    </SingleRowPropEditor>
  )
}

export default React.memo(DetailSimplePropEditor)
