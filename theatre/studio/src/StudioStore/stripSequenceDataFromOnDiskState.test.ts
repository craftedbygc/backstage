import {stripSequenceDataFromOnDiskState} from './stripSequenceDataFromOnDiskState'
import type {OnDiskState} from '@unseenco/theatre-core/projects/store/storeTypes'
import type {SheetId} from '@unseenco/backstage-shared/utils/ids'

describe('stripSequenceDataFromOnDiskState', () => {
  it('removes sequence fields from each sheet', () => {
    const sheetId = 'Main' as SheetId
    const state = {
      definitionVersion: '0.4.0',
      revisionHistory: [],
      sheetsById: {
        [sheetId]: {
          staticOverrides: {byObject: {}},
          sequence: {
            type: 'PositionalSequence',
            length: 10,
            tracksByObject: {},
          },
          sequencesById: {
            default: {
              type: 'PositionalSequence',
              length: 10,
              tracksByObject: {},
            },
          },
        },
      },
    } as unknown as OnDiskState

    const stripped = stripSequenceDataFromOnDiskState(state)
    const sheet = stripped.sheetsById[sheetId]!
    expect(sheet.sequence).toBeUndefined()
    expect(sheet.sequencesById).toBeUndefined()
    expect(sheet.staticOverrides).toEqual({byObject: {}})
  })
})
