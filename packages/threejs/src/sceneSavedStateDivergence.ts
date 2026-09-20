import type {ISheetObject} from '@unseenco/backstage'
import type {Scene} from 'three'
import type {Object3D} from 'three'
import {
  getStudio,
  sheetObjectDivergesFromSavedState,
} from '@unseenco/backstage/studio'
import {val} from '@unseenco/backstage/dataverse'
import {getSheetObjectForObject3D} from './objectRegistry'

function sheetObjectHasDivergedFromSavedState(
  sheetObject: ISheetObject,
): boolean {
  const project = val(getStudio().projectsP)[sheetObject.address.projectId]
  const loadedProjectHistoric = project?.config.state
  if (!loadedProjectHistoric) {
    return false
  }

  const studio = getStudio()!
  const {projectId, sheetId, objectKey} = sheetObject.address

  const currentProjectHistoric = val(
    studio.atomP.historic.coreByProject[projectId],
  )
  const currentProjectAhistoric = val(
    studio.atomP.ahistoric.coreByProject[projectId],
  )

  const currentSheet = currentProjectHistoric?.sheetsById[sheetId]
  const onDiskSheet = loadedProjectHistoric.sheetsById[sheetId]
  const currentAhistoricSheet = currentProjectAhistoric?.sheetsById?.[sheetId]

  return sheetObjectDivergesFromSavedState(
    currentSheet,
    onDiskSheet,
    objectKey,
    currentAhistoricSheet,
  )
}

/**
 * True when any Backstage sheet object registered on this Three.js scene graph
 * has diverged from the JSON state passed to `getProject()`.
 */
export function sceneHasDivergedFromSavedState(scene: Scene): boolean {
  let diverged = false
  scene.traverse((object: Object3D) => {
    if (diverged) return
    const sheetObject = getSheetObjectForObject3D(object)
    if (!sheetObject) return
    if (sheetObjectHasDivergedFromSavedState(sheetObject)) {
      diverged = true
    }
  })
  return diverged
}
