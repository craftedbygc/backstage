import type {DopeSheetSelection} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import type {SequenceEditorPanelLayout} from '@unseenco/backstage/studio/panels/SequenceEditorPanel/layout/layout'
import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import type {ObjectAddressKey} from '@unseenco/backstage-shared/utils/ids'
import getStudio from '@unseenco/backstage/studio/getStudio'
import type {Pointer} from '@unseenco/backstage/dataverse'
import {val} from '@unseenco/backstage/dataverse'
import type Sheet from '@unseenco/backstage/sheets/Sheet'
import {getOutlineSelection} from '@unseenco/backstage/studio/selectors'
import {isSheetObject} from '@unseenco/backstage-shared/instanceTypes'

export function getDopeSheetSelectionFromLayoutP(
  layoutP: Pointer<SequenceEditorPanelLayout>,
): DopeSheetSelection | undefined {
  const selectionAtom = val(layoutP.selectionAtom)
  return val(selectionAtom.pointer.current)
}

export function objectHasDopeSheetKeyframeSelection(
  objectKey: ObjectAddressKey,
  selection: DopeSheetSelection | undefined,
): boolean {
  if (!selection) return false
  const byTrackId = selection.byObjectKey[objectKey]?.byTrackId
  if (!byTrackId) return false
  for (const track of Object.values(byTrackId)) {
    if (!track) continue
    if (Object.keys(track.byKeyframeId).length > 0) {
      return true
    }
  }
  return false
}

export function dopeSheetSelectionHasAnyKeyframes(
  selection: DopeSheetSelection | undefined,
): boolean {
  if (!selection) return false
  return Object.keys(selection.byObjectKey).some((objectKey) =>
    objectHasDopeSheetKeyframeSelection(objectKey, selection),
  )
}

export function isSheetObjectSequencerSelected(
  sheetObject: SheetObject,
  dopeSheetSelection: DopeSheetSelection | undefined,
): boolean {
  if (getOutlineSelection().includes(sheetObject)) {
    return true
  }
  return objectHasDopeSheetKeyframeSelection(
    sheetObject.address.objectKey,
    dopeSheetSelection,
  )
}

export function sheetObjectsWithDopeSheetKeyframeSelection(
  sheet: Sheet,
  selection: DopeSheetSelection,
): SheetObject[] {
  const result: SheetObject[] = []
  for (const objectKey of Object.keys(selection.byObjectKey)) {
    if (!objectHasDopeSheetKeyframeSelection(objectKey, selection)) {
      continue
    }
    const sheetObject = val(sheet.objectsP[objectKey])
    if (sheetObject) {
      result.push(sheetObject)
    }
  }
  return result
}

export function selectSheetInOutlineAfterDopeSheetKeyframeDeselect(
  sheet: Sheet,
): void {
  getStudio().transaction(({stateEditors}) => {
    stateEditors.studio.historic.panels.outline.selection.set([sheet])
  })
}

export function syncOutlineSelectionFromDopeSheetKeyframeSelection(
  sheet: Sheet,
  selection: DopeSheetSelection | undefined,
): void {
  if (!selection || !dopeSheetSelectionHasAnyKeyframes(selection)) {
    selectSheetInOutlineAfterDopeSheetKeyframeDeselect(sheet)
    return
  }
  const sheetObjects = sheetObjectsWithDopeSheetKeyframeSelection(
    sheet,
    selection,
  )
  if (sheetObjects.length === 0) {
    return
  }
  getStudio().transaction(({stateEditors}) => {
    stateEditors.studio.historic.panels.outline.selection.set(sheetObjects)
  })
}

export function outlineSelectedSheetObjects(): SheetObject[] {
  return getOutlineSelection().filter(isSheetObject)
}
