import type {Pointer} from '@unseenco/backstage/dataverse'
import {val} from '@unseenco/backstage/dataverse'
import {clamp} from 'lodash-es'
import {useMemo} from 'react'
import useDrag from '@unseenco/backstage/studio/uiComponents/useDrag'
import {useCssCursorLock} from '@unseenco/backstage/studio/uiComponents/PointerEventsHandler'
import DopeSnap from '@unseenco/backstage/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'
import {
  snapToAll,
  snapToNone,
} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/DopeSheet/Right/KeyframeSnapTarget'
import {getStudioSequence} from '@unseenco/backstage/studio/utils/activeSequenceVariant'
import {syncPageScrollToSequencePosition} from '@unseenco/backstage/studio/sheets/syncPageScrollToSequencePosition'
import type {SequenceEditorPanelLayout} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'

export function useDragPlayheadHandlers(
  layoutP: Pointer<SequenceEditorPanelLayout>,
  containerEl: HTMLDivElement | null,
) {
  const handlers = useMemo((): Parameters<typeof useDrag>[1] => {
    return {
      debugName: 'useDragPlayheadHandlers',
      onDragStart(event) {
        if (event.target instanceof HTMLInputElement) {
          return false
        }
        if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
          return false
        }
        if (
          event
            .composedPath()
            .some((el) => el instanceof HTMLElement && el.draggable === true)
        ) {
          return false
        }

        const initialPositionInClippedSpace =
          event.clientX - containerEl!.getBoundingClientRect().left

        const initialPositionInUnitSpace = clamp(
          val(layoutP.clippedSpace.toUnitSpace)(initialPositionInClippedSpace),
          0,
          Infinity,
        )

        const setIsSeeking = val(layoutP.seeker.setIsSeeking)
        const sheet = val(layoutP.sheet)
        const sequence = getStudioSequence(sheet)

        sequence.position = initialPositionInUnitSpace
        syncPageScrollToSequencePosition(sheet)

        const posBeforeSeek = initialPositionInUnitSpace
        const scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
        setIsSeeking(true)
        snapToAll()

        return {
          onDrag(dx: number, _, event) {
            const deltaPos = scaledSpaceToUnitSpace(dx)
            const unsnappedPos = clamp(
              posBeforeSeek + deltaPos,
              0,
              sequence.length,
            )

            let newPosition = unsnappedPos
            const snapPos = DopeSnap.checkIfMouseEventSnapToPos(event, {})
            if (snapPos != null) {
              newPosition = snapPos
            }

            sequence.position = newPosition
            syncPageScrollToSequencePosition(val(layoutP.sheet))
          },
          onDragEnd() {
            setIsSeeking(false)
            snapToNone()
          },
        }
      },
    }
  }, [layoutP, containerEl])

  const [isDragging] = useDrag(containerEl, handlers)
  useCssCursorLock(isDragging, 'draggingPositionInSequenceEditor', 'ew-resize')
}
