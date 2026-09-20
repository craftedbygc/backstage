import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import type {NamespacedObjects} from '@unseenco/backstage/studio/panels/OutlinePanel/outlinePanelUtils'

const RE_SPLIT_BY_SLASH_WITHOUT_WHITESPACE = /\s*\/\s*/g

/** Split a Backstage slashed object key into namespace path segments (outline-compatible). */
export function splitObjectKeyNamespacePath(objectKey: string): string[] {
  const segments = objectKey.split(RE_SPLIT_BY_SLASH_WITHOUT_WHITESPACE)
  return segments.filter((segment) => segment.length > 0)
}

export function addSheetObjectToNamespaceMap(
  mutObjects: NamespacedObjects,
  object: SheetObject,
  path = splitObjectKeyNamespacePath(object.address.objectKey),
) {
  const [next, ...rest] = path
  let existing = mutObjects.get(next)
  if (!existing) {
    existing = {
      nested: undefined,
      object: undefined,
      path: [...path],
    }
    mutObjects.set(next, existing)
  }

  if (rest.length === 0) {
    existing.object = object
  } else {
    if (!existing.nested) {
      existing.nested = new Map()
    }
    addSheetObjectToNamespaceMap(existing.nested, object, rest)
  }
}

export function buildSequenceEditorNamespaceMap(
  objects: SheetObject[],
): NamespacedObjects {
  const root: NamespacedObjects = new Map()
  for (const object of objects) {
    addSheetObjectToNamespaceMap(root, object)
  }
  return root
}
