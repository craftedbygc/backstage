import {validateAndSanitiseSlashedPathOrThrow} from '@unseenco/backstage-shared/utils/slashedPaths'

/**
 * Theatre sheet object key for a GSAP outline proxy (`Namespace / label`),
 * matching {@link ISheet.object} sanitisation.
 */
export function buildGsapSheetObjectKey(namespace: string, label: string): string {
  return validateAndSanitiseSlashedPathOrThrow(
    `${namespace} / ${label}`,
    'buildGsapSheetObjectKey',
  )
}
