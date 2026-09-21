import type {Keyframe} from '@unseenco/backstage/projects/store/types/SheetState_Historic'
import {val} from '@unseenco/backstage/dataverse'
import React from 'react'
import styled from 'styled-components'
import SingleKeyframeConnector from './BasicKeyframeConnector'
import SingleKeyframeDot from './SingleKeyframeDot'
import {singleKeyframeEditorPropsAreEqual} from './keyframeDopeSheetVisualEqual'
import type {ISingleKeyframeEditorProps} from './singleKeyframeEditorTypes'

export type {ISingleKeyframeEditorProps} from './singleKeyframeEditorTypes'

const SingleKeyframeEditorContainer = styled.div`
  position: absolute;
`

const noConnector = <></>

const SingleKeyframeEditor: React.VFC<ISingleKeyframeEditorProps> = React.memo(
  (props) => {
    const {
      index,
      track: {data: trackData},
    } = props
    const cur = trackData.keyframes[index]
    const next = trackData.keyframes[index + 1]

    const connected = cur.connectedRight && !!next

    return (
      <SingleKeyframeEditorContainer
        style={{
          top: `${props.leaf.nodeHeight / 2}px`,
          left: `calc(${val(
            props.layoutP.scaledSpace.leftPadding,
          )}px + calc(var(--unitSpaceToScaledSpaceMultiplier) * ${
            cur.position
          }px))`,
        }}
      >
        <SingleKeyframeDot {...props} itemKey={props.itemKey} />
        {connected ? <SingleKeyframeConnector {...props} /> : noConnector}
      </SingleKeyframeEditorContainer>
    )
  },
  singleKeyframeEditorPropsAreEqual,
)

export default SingleKeyframeEditor
