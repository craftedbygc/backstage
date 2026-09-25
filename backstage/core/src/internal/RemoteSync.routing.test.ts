import RemoteSync, {REMOTE_SYNC_PROTOCOL_VERSION} from './RemoteSync'
import type Project from '@unseenco/backstage/projects/Project'

const TAB_ID_GLOBAL_KEY = '__unseenco_backstage_window_tab_id_v1__'

function setTabId(id: string) {
  ;(globalThis as unknown as Record<string, string>)[TAB_ID_GLOBAL_KEY] = id
}

function createProjectStub(projectId = 'proj'): Project {
  return {
    address: {projectId},
  } as Project
}

describe('RemoteSync tab routing', () => {
  afterEach(() => {
    delete (globalThis as unknown as Record<string, unknown>)[TAB_ID_GLOBAL_KEY]
  })

  test('only the opener listener responds to editorHello with historic state', () => {
    setTabId('opener-tab')
    const openerSync = new RemoteSync(createProjectStub())
    const openerHistoric = jest.fn()
    ;(
      openerSync as unknown as {
        _broadcastHistoricSnapshot: (o: unknown) => void
      }
    )._broadcastHistoricSnapshot = openerHistoric

    setTabId('other-tab')
    const otherSync = new RemoteSync(createProjectStub())
    const otherHistoric = jest.fn()
    ;(
      otherSync as unknown as {
        _broadcastHistoricSnapshot: (o: unknown) => void
      }
    )._broadcastHistoricSnapshot = otherHistoric

    const editorHello = {
      protocolVersion: REMOTE_SYNC_PROTOCOL_VERSION,
      senderId: 'editor-tab',
      targetId: 'opener-tab',
      event: 'editorHello' as const,
      data: {},
    }

    setTabId('opener-tab')
    ;(openerSync as unknown as {_handleIncoming: (m: unknown) => void})
      ._handleIncoming(editorHello)
    setTabId('other-tab')
    ;(otherSync as unknown as {_handleIncoming: (m: unknown) => void})
      ._handleIncoming(editorHello)

    expect(openerHistoric).toHaveBeenCalledWith({
      force: true,
      targetId: 'editor-tab',
    })
    expect(otherHistoric).not.toHaveBeenCalled()
  })

  test('ignores messages addressed to a different tab', () => {
    setTabId('tab-a')
    const sync = new RemoteSync(createProjectStub())
    const historic = jest.fn()
    ;(
      sync as unknown as {_broadcastHistoricSnapshot: (o: unknown) => void}
    )._broadcastHistoricSnapshot = historic

    ;(sync as unknown as {_handleIncoming: (m: unknown) => void})._handleIncoming(
      {
        protocolVersion: REMOTE_SYNC_PROTOCOL_VERSION,
        senderId: 'editor-tab',
        targetId: 'tab-b',
        event: 'editorHello',
        data: {},
      },
    )

    expect(historic).not.toHaveBeenCalled()
  })
})
