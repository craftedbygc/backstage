import type {ISheetObject} from '@unseenco/theatre-core'
import type {Scene} from 'three'
import type {Object3D} from 'three'
import {sheetObjectDivergesFromSavedState} from '@unseenco/theatre-studio/propEditors/objectHasDivergedFromSavedState'
import getStudio from '@unseenco/theatre-studio/getStudio'
import {val} from '@unseenco/theatre-dataverse'
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
 * True when any Theatre sheet object registered on this Three.js scene graph
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
