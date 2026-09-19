import type {ISheetOptions} from '@unseenco/theatre-core/projects/TheatreProject'
import type Sheet from '@unseenco/theatre-core/sheets/Sheet'

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

  if (opts.gsap === true) {
    sheet.enableGsapSequenceBridge()
  }
}
