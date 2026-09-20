import type {ISheetOptions} from '@unseenco/backstage/projects/BackstageProject'
import type Sheet from '@unseenco/backstage/sheets/Sheet'

/**
 * Applies runtime {@link ISheetOptions} to a sheet instance (idempotent where noted).
 */
export function applySheetRuntimeOptions(
  sheet: Sheet,
  opts: ISheetOptions | undefined,
): void {
  if (!opts) return

  if (opts.sequenceMode !== undefined) {
    sheet.setSequenceMode(opts.sequenceMode)
  }

  if (opts.scrollDriver !== undefined) {
    sheet.setPageScrollDriver(opts.scrollDriver)
  }

  if (opts.gsap === true) {
    sheet.enableGsapSequenceBridge()
  }
}
