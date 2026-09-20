import {
  REMOTE_HISTORIC_SYNC_DEBOUNCE_MS,
  shouldSyncPageScrollWhenApplyingTimelineUpdate,
} from './RemoteSync'

describe('RemoteSync', () => {
  describe('shouldSyncPageScrollWhenApplyingTimelineUpdate', () => {
    it('syncs page scroll on the main listener when remote scrubs', () => {
      expect(
        shouldSyncPageScrollWhenApplyingTimelineUpdate(false, 'page'),
      ).toBe(true)
    })

    it('does not sync page scroll on the remote editor when main scrolls', () => {
      expect(
        shouldSyncPageScrollWhenApplyingTimelineUpdate(true, 'page'),
      ).toBe(false)
    })

    it('ignores non-page sequence modes', () => {
      expect(
        shouldSyncPageScrollWhenApplyingTimelineUpdate(false, 'time'),
      ).toBe(false)
    })
  })

  it('uses a debounce window for historic pushes from the editor', () => {
    expect(REMOTE_HISTORIC_SYNC_DEBOUNCE_MS).toBeGreaterThan(0)
  })
})
