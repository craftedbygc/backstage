import {privateAPI} from '@unseenco/backstage/privateAPIs'
import type {ISheetObject} from '@unseenco/backstage/sheetObjects/BackstageSheetObject'
import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import {isSheetObjectPublicAPI} from '@unseenco/backstage-shared/instanceTypes'
import {InvalidArgumentError} from '@unseenco/backstage-shared/utils/errors'
import userReadableTypeOfValue from '@unseenco/backstage-shared/utils/userReadableTypeOfValue'

/**
 * Validates and resolves public sheet objects for {@link ISheetObject.showPropsOf}.
 * Sources must be from the same sheet instance as the host and must not include the host.
 */
export function resolveShowPropsOfSources(
  host: SheetObject,
  objects: ISheetObject<any>[],
  apiName: string,
): SheetObject[] {
  if (!Array.isArray(objects)) {
    throw new InvalidArgumentError(
      `Argument to ${apiName} must be an array of sheet objects. ` +
        `Instead, it was ${userReadableTypeOfValue(objects)}.`,
    )
  }

  return objects.map((obj, index) => {
    if (!isSheetObjectPublicAPI(obj)) {
      throw new InvalidArgumentError(
        `Argument to ${apiName} at index ${index} must be a sheet object ` +
          `(from sheet.object(...)). Instead, it was ${userReadableTypeOfValue(
            obj,
          )}.`,
      )
    }

    const internal = privateAPI(obj)

    if (internal === host) {
      throw new InvalidArgumentError(
        `${apiName} cannot include the host object itself.`,
      )
    }

    if (
      internal.address.projectId !== host.address.projectId ||
      internal.address.sheetId !== host.address.sheetId ||
      internal.address.sheetInstanceId !== host.address.sheetInstanceId
    ) {
      throw new InvalidArgumentError(
        `${apiName} only accepts objects from the same sheet instance.`,
      )
    }

    return internal
  })
}
