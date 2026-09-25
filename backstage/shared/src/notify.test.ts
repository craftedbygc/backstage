/*
 * @jest-environment jsdom
 */
import {
  escapeNotificationText,
  installStudioGlobalErrorNotificationListeners,
} from './notify'

const LISTENER_GLOBAL_KEY =
  '__unseenco_backstage_studio_global_error_notification_listeners_v1__'

describe('notify global error listeners', () => {
  afterEach(() => {
    delete (globalThis as Record<string, unknown>)[LISTENER_GLOBAL_KEY]
  })

  test('does not install listeners on module import', () => {
    const addSpy = jest.spyOn(window, 'addEventListener')
    jest.isolateModules(() => {
      require('./notify')
    })
    const errorListeners = addSpy.mock.calls.filter((c) => c[0] === 'error')
    expect(errorListeners).toHaveLength(0)
    addSpy.mockRestore()
  })

  test('installStudioGlobalErrorNotificationListeners runs once', () => {
    const addSpy = jest.spyOn(window, 'addEventListener')
    installStudioGlobalErrorNotificationListeners()
    installStudioGlobalErrorNotificationListeners()
    const errorListeners = addSpy.mock.calls.filter((c) => c[0] === 'error')
    expect(errorListeners).toHaveLength(1)
    addSpy.mockRestore()
  })

  test('escapeNotificationText neutralises HTML', () => {
    const xss = '<img src=x onerror=alert(1)>'
    expect(escapeNotificationText(xss)).toBe(
      '&lt;img src=x onerror=alert(1)&gt;',
    )
  })
})
