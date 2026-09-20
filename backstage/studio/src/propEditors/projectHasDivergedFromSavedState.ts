import type Project from '@unseenco/backstage/projects/Project'
import type {SheetId} from '@unseenco/backstage-shared/utils/ids'
import {val} from '@unseenco/backstage/dataverse'
import getStudio from '@unseenco/backstage/studio/getStudio'
import {
  objectKeysReferencedInSheet,
  sheetObjectDivergesFromSavedState,
} from './objectHasDivergedFromSavedState'

/**
 * Returns true when any sheet in the project differs from the state loaded from
 * the on-disk JSON (`config.state` passed to `getProject()`).
 */
export function projectHasDivergedFromSavedState(project: Project): boolean {
  const onDiskProjectHistoric = project.config.state
  if (!onDiskProjectHistoric) {
    return false
  }

  const studio = getStudio()!
  const projectId = project.address.projectId

  const currentProjectHistoric = val(
    studio.atomP.historic.coreByProject[projectId],
  )
  const currentProjectAhistoric = val(
    studio.atomP.ahistoric.coreByProject[projectId],
  )

  const sheetIds = new Set<SheetId>([
    ...Object.keys(currentProjectHistoric?.sheetsById ?? {}),
    ...Object.keys(onDiskProjectHistoric.sheetsById ?? {}),
  ] as SheetId[])

  for (const sheetId of sheetIds) {
    const currentSheet = currentProjectHistoric?.sheetsById[sheetId]
    const onDiskSheet = onDiskProjectHistoric.sheetsById[sheetId]
    const currentAhistoricSheet =
      currentProjectAhistoric?.sheetsById?.[sheetId]

    const objectKeys = new Set([
      ...objectKeysReferencedInSheet(currentSheet),
      ...objectKeysReferencedInSheet(onDiskSheet),
    ])

    for (const objectKey of objectKeys) {
      if (
        sheetObjectDivergesFromSavedState(
          currentSheet,
          onDiskSheet,
          objectKey,
          currentAhistoricSheet,
        )
      ) {
        return true
      }
    }
  }

  return false
}

/** True when any loaded project has unsaved changes vs its `config.state`. */
export function studioHasDivergedFromSavedState(): boolean {
  const projects = val(getStudio().projectsP)

  for (const project of Object.values(projects)) {
    if (project && projectHasDivergedFromSavedState(project)) {
      return true
    }
  }

  return false
}
