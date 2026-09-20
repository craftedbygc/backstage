import type {IProject, ISheet, ISheetObject} from '@unseenco/backstage'
import type Project from '@unseenco/backstage/projects/Project'
import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import type SheetObjectTemplate from '@unseenco/backstage/sheetObjects/SheetObjectTemplate'
import type Sheet from '@unseenco/backstage/sheets/Sheet'
import type SheetTemplate from '@unseenco/backstage/sheets/SheetTemplate'
import type {$IntentionalAny} from './utils/types'

/**
 * Since \@unseenco/backstage and \@unseenco/backstage/studio are separate bundles,
 * they cannot use `x instanceof Y` to detect object types.
 *
 * The functions in this module are supposed to be a replacement for that.
 */

export const isProject = typeAsserter<Project>('Backstage_Project')

export const isSheet = typeAsserter<Sheet>('Backstage_Sheet')
export const isSheetTemplate = typeAsserter<SheetTemplate>(
  'Backstage_SheetTemplate',
)

export const isSheetObject = typeAsserter<SheetObject>('Backstage_SheetObject')

export const isSheetObjectTemplate = typeAsserter<SheetObjectTemplate>(
  'Backstage_SheetObjectTemplate',
)

export const isProjectPublicAPI = typeAsserter<IProject>(
  'Backstage_Project_PublicAPI',
)

export const isSheetPublicAPI = typeAsserter<ISheet>('Backstage_Sheet_PublicAPI')

export const isSheetObjectPublicAPI = typeAsserter<ISheetObject>(
  'Backstage_SheetObject_PublicAPI',
)

function typeAsserter<T extends {type: string}>(
  t: T['type'],
): (v: unknown) => v is T {
  return (v: unknown): v is T =>
    typeof v === 'object' && !!v && (v as $IntentionalAny).type === t
}
