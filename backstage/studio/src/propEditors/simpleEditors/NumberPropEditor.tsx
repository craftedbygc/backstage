import type {PropTypeConfig_Number} from '@unseenco/backstage/propTypes'
import {getNumberPrecisionFromPropConfig} from '@unseenco/backstage-shared/propTypes/numberPrecision'
import BasicNumberInput from '@unseenco/backstage/studio/uiComponents/form/BasicNumberInput'
import React, {useCallback, useMemo} from 'react'
import type {ISimplePropEditorReactProps} from './ISimplePropEditorReactProps'

function NumberPropEditor({
  propConfig,
  editingTools,
  value,
  autoFocus,
  label,
  embedded,
  contentPadding,
}: ISimplePropEditorReactProps<PropTypeConfig_Number> & {
  embedded?: boolean
  /** Overrides BasicNumberInput inner row padding (default `0 10px`). */
  contentPadding?: string
}) {
  const precision = useMemo(
    () => getNumberPrecisionFromPropConfig(propConfig),
    [propConfig],
  )

  const nudge = useCallback(
    (params: {deltaX: number; deltaFraction: number; magnitude: number}) => {
      return propConfig.nudgeFn({...params, config: propConfig})
    },
    [propConfig],
  )

  return (
    <BasicNumberInput
      value={value}
      temporarilySetValue={editingTools.temporarilySetValue}
      discardTemporaryValue={editingTools.discardTemporaryValue}
      permanentlySetValue={editingTools.permanentlySetValue}
      range={propConfig.range}
      nudge={nudge}
      precision={precision}
      autoFocus={autoFocus}
      label={label}
      embedded={embedded}
      contentPadding={contentPadding}
    />
  )
}

export default NumberPropEditor
