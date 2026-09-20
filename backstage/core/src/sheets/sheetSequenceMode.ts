/** How the sheet sequence maps to the sequencer UI and playback driver. */
export type SheetSequenceMode = 'time' | 'page'

/** Fixed sequence length in page mode (= 100% scroll range). */
export const PAGE_MODE_SEQUENCE_LENGTH = 100

/** Sub-units per unit in page mode: 10 → 0.1% snap steps. */
export const PAGE_MODE_SUB_UNITS_PER_UNIT = 10
