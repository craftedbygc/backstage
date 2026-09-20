import type {OnDiskState} from '@unseenco/backstage/projects/store/storeTypes'

/**
 * Removes sequence/timeline data from exported project JSON (studio-lite export).
 * Full Backstage accepts the resulting static-only subset.
 */
export function stripSequenceDataFromOnDiskState(
  state: OnDiskState,
): OnDiskState {
  const sheetsById = {...state.sheetsById}

  for (const sheetId of Object.keys(sheetsById)) {
    const sheet = sheetsById[sheetId]
    if (!sheet) continue

    const {sequence: _sequence, sequencesById: _sequencesById, ...rest} = sheet

    sheetsById[sheetId] = rest
  }

  return {
    ...state,
    sheetsById,
  }
}
