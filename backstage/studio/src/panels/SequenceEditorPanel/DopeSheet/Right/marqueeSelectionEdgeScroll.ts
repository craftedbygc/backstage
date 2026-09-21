import type {SequenceEditorPanelLayout} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import {clampRangeToSequence} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/PlaybackControls/sequenceZoom'
import {isSheetInPageMode} from '@unseenco/backstage/studio/sheets/sheetSequenceMode'
import {getStudioSequence} from '@unseenco/backstage/studio/utils/activeSequenceVariant'
import type {Pointer} from '@unseenco/backstage/dataverse'
import {val} from '@unseenco/backstage/dataverse'
import {mapValues} from 'lodash-es'

const EDGE_THRESHOLD_PX = 48
const MAX_VERTICAL_SCROLL_PX_PER_FRAME = 14
const HORIZONTAL_PAN_FACTOR = 0.12

function edgeIntensity(
  pointer: number,
  rectStart: number,
  rectEnd: number,
): number {
  const threshold = EDGE_THRESHOLD_PX
  if (pointer < rectStart + threshold) {
    return -Math.min(1, (rectStart + threshold - pointer) / threshold)
  }
  if (pointer > rectEnd - threshold) {
    return Math.min(1, (pointer - (rectEnd - threshold)) / threshold)
  }
  return 0
}

export function panSequenceEditorClippedSpace(
  layoutP: Pointer<SequenceEditorPanelLayout>,
  deltaInUnitSpace: number,
): void {
  if (deltaInUnitSpace === 0) {
    return
  }
  const sheet = val(layoutP.sheet)
  const oldRange = val(layoutP.clippedSpace.range)
  const newRange = mapValues(oldRange, (p) => p + deltaInUnitSpace)
  const setRange = val(layoutP.clippedSpace.setRange)
  if (isSheetInPageMode(sheet)) {
    setRange(clampRangeToSequence(newRange, getStudioSequence(sheet).length))
  } else {
    setRange(newRange)
  }
}

export function applyMarqueeSelectionEdgeScroll(options: {
  layoutP: Pointer<SequenceEditorPanelLayout>
  clientX: number
  clientY: number
  horizontalViewportEl: HTMLElement | null | undefined
  verticalViewportEl: HTMLElement | null | undefined
  scrollVerticalBy: (deltaY: number) => void
}): void {
  const {
    layoutP,
    clientX,
    clientY,
    horizontalViewportEl,
    verticalViewportEl,
    scrollVerticalBy,
  } = options

  if (horizontalViewportEl) {
    const hRect = horizontalViewportEl.getBoundingClientRect()
    const hIntensity = edgeIntensity(clientX, hRect.left, hRect.right)
    if (hIntensity !== 0) {
      const oldRange = val(layoutP.clippedSpace.range)
      const windowSize = oldRange.end - oldRange.start
      const sequenceLength = getStudioSequence(val(layoutP.sheet)).length
      const speed = windowSize / sequenceLength
      panSequenceEditorClippedSpace(
        layoutP,
        hIntensity * HORIZONTAL_PAN_FACTOR * speed,
      )
    }
  }

  if (verticalViewportEl) {
    const vRect = verticalViewportEl.getBoundingClientRect()
    const vIntensity = edgeIntensity(clientY, vRect.top, vRect.bottom)
    if (vIntensity !== 0) {
      scrollVerticalBy(vIntensity * MAX_VERTICAL_SCROLL_PX_PER_FRAME)
    }
  }
}

export const SEQUENCE_EDITOR_VERTICAL_SCROLL_ATTR =
  'data-sequence-editor-vertical-scroll'
