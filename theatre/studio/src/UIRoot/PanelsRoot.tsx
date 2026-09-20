import OutlinePanel from '@unseenco/theatre-studio/panels/OutlinePanel/OutlinePanel'
import DetailPanel from '@unseenco/theatre-studio/panels/DetailPanel/DetailPanel'
import React from 'react'
import getStudio from '@unseenco/theatre-studio/getStudio'
import {useVal} from '@unseenco/theatre-react'
import ExtensionPaneWrapper from '@unseenco/theatre-studio/panels/BasePanel/ExtensionPaneWrapper'
import SequenceEditorPanel from '@unseenco/theatre-studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import {isTheatreLiteStudio} from '@unseenco/theatre-studio/utils/theatreLiteMode'

const PanelsRoot: React.FC = () => {
  const panes = useVal(getStudio().paneManager.allPanesD)
  const pinSequenceEditorPinned = useVal(
    getStudio().atomP.ahistoric.pinSequenceEditor,
  )
  const pinSequenceEditor =
    !isTheatreLiteStudio() && pinSequenceEditorPinned !== false
  const paneEls = Object.entries(panes).map(([instanceId, paneInstance]) => {
    return (
      <ExtensionPaneWrapper
        key={`pane-${instanceId}`}
        paneInstance={paneInstance!}
      />
    )
  })

  return (
    <>
      {paneEls}
      <OutlinePanel />
      <DetailPanel />
      {pinSequenceEditor && <SequenceEditorPanel />}
    </>
  )
}

export default PanelsRoot
