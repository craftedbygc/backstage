import type {Keyframe} from '@unseenco/backstage/projects/store/types/SheetState_Historic'
import type {
  DopeSheetSelection,
  SequenceEditorPanelLayout,
} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorTree_PrimitiveProp} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/tree'
import type {Pointer} from '@unseenco/backstage/dataverse'
import type {TrackWithId} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import type {StudioSheetItemKey} from '@unseenco/backstage-shared/utils/ids'

export type ISingleKeyframeEditorProps = {
  index: number
  keyframe: Keyframe
  track: TrackWithId
  itemKey: StudioSheetItemKey
  layoutP: Pointer<SequenceEditorPanelLayout>
  leaf: SequenceEditorTree_PrimitiveProp
  selection: undefined | DopeSheetSelection
}
