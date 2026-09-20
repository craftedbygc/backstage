import OutlinePanel from '@unseenco/theatre-studio/panels/OutlinePanel/OutlinePanel'
import DetailPanel from '@unseenco/theatre-studio/panels/DetailPanel/DetailPanel'
import React from 'react'
import getStudio from '@unseenco/theatre-studio/getStudio'
import {useVal} from '@unseenco/backstage/react'
import ExtensionPaneWrapper from '@unseenco/theatre-studio/panels/BasePanel/ExtensionPaneWrapper'
import SequenceEditorPanel from '@unseenco/theatre-studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import DockedLayout, {
  DockedDetailsSlot,
  DockedOutlineSlot,
  DockedSequencerSlot,
  MeasuredDockedToolbarSlot,
  DockedViewportSlot,
} from './DockedLayout'
import GlobalToolbar from '@unseenco/theatre-studio/toolbars/GlobalToolbar'
import {isTheatreLiteStudio} from '@unseenco/theatre-studio/utils/theatreLiteMode'

const DockedPanelsRoot: React.FC = () => {
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
    <DockedLayout>
      <MeasuredDockedToolbarSlot>
        <GlobalToolbar />
      </MeasuredDockedToolbarSlot>
      <DockedOutlineSlot>
        <OutlinePanel />
      </DockedOutlineSlot>
      <DockedViewportSlot />
      <DockedDetailsSlot>
        <DetailPanel />
      </DockedDetailsSlot>
      {pinSequenceEditor && (
        <DockedSequencerSlot>
          <SequenceEditorPanel />
        </DockedSequencerSlot>
      )}
      {paneEls}
    </DockedLayout>
  )
}

export default DockedPanelsRoot
