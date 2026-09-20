import OutlinePanel from '@unseenco/backstage/studio/panels/OutlinePanel/OutlinePanel'
import DetailPanel from '@unseenco/backstage/studio/panels/DetailPanel/DetailPanel'
import React from 'react'
import getStudio from '@unseenco/backstage/studio/getStudio'
import {useVal} from '@unseenco/backstage/react'
import ExtensionPaneWrapper from '@unseenco/backstage/studio/panels/BasePanel/ExtensionPaneWrapper'
import SequenceEditorPanel from '@unseenco/backstage/studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import {isBackstageLiteStudio} from '@unseenco/backstage/studio/utils/backstageLiteMode'

const PanelsRoot: React.FC = () => {
  const panes = useVal(getStudio().paneManager.allPanesD)
  const pinSequenceEditorPinned = useVal(
    getStudio().atomP.ahistoric.pinSequenceEditor,
  )
  const pinSequenceEditor =
    !isBackstageLiteStudio() && pinSequenceEditorPinned !== false
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
