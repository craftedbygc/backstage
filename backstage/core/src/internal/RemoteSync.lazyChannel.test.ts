/*
 * @jest-environment jsdom
 */
import '@unseenco/backstage/studio'
import {getProject} from '@unseenco/backstage'
import {privateAPI} from '@unseenco/backstage/privateAPIs'
import {compound} from '@unseenco/backstage/propTypes'
import * as t from '@unseenco/backstage/propTypes'
import globals from '@unseenco/backstage-shared/globals'
import getStudio from '@unseenco/backstage/studio/getStudio'

class MockBroadcastChannel {
  static instances: MockBroadcastChannel[] = []
  onmessage: ((event: MessageEvent) => void) | null = null
  constructor(public readonly name: string) {
    MockBroadcastChannel.instances.push(this)
  }
  postMessage(_data: unknown) {}
  close() {}
}

describe('RemoteSync lazy BroadcastChannel', () => {
  const originalBroadcastChannel = globalThis.BroadcastChannel

  beforeEach(() => {
    MockBroadcastChannel.instances = []
    // @ts-expect-error test mock
    globalThis.BroadcastChannel = MockBroadcastChannel
  })

  afterEach(() => {
    if (originalBroadcastChannel === undefined) {
      // @ts-expect-error restore
      delete globalThis.BroadcastChannel
    } else {
      globalThis.BroadcastChannel = originalBroadcastChannel
    }
  })

  test('does not create a BroadcastChannel until attachStudio', () => {
    const project = privateAPI(
      getProject('remote-sync-lazy', {
        state: {
          sheetsById: {},
          definitionVersion: globals.currentProjectStateDefinitionVersion,
          revisionHistory: [],
        },
      }),
    )
    const remoteSync = project._remoteSync
    expect(MockBroadcastChannel.instances).toHaveLength(0)

    remoteSync.attachStudio(getStudio()! as never)
    expect(MockBroadcastChannel.instances).toHaveLength(1)
  })

  test('attaches editor object listeners for objects registered before attachStudio', async () => {
    const previousHash = window.location.hash
    window.location.hash = '#backstage-editor'

    const project = privateAPI(
      getProject('remote-sync-preattach', {
        state: {
          sheetsById: {},
          definitionVersion: globals.currentProjectStateDefinitionVersion,
          revisionHistory: [],
        },
      }),
    )
    const sheet = project.getOrCreateSheet('Scene' as never)
    sheet.createObject('obj' as never, {}, compound({x: t.number(0)}))

    const remoteSync = project._remoteSync
    const remoteSyncPrivate = remoteSync as unknown as {
      objectUnsubs: Map<string, () => void>
    }
    expect(remoteSyncPrivate.objectUnsubs.size).toBe(0)

    const studio = getStudio()!
    void studio.initialize({usePersistentStorage: false})
    await studio.initialized
    remoteSync.attachStudio(studio)
    expect(remoteSyncPrivate.objectUnsubs.size).toBe(1)

    window.location.hash = previousHash
  })
})
