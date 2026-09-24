import {
  isRemoteEditorWindow,
  LEGACY_REMOTE_EDITOR_HASH,
  REMOTE_EDITOR_HASH,
} from './remoteEditorWindow'

describe('isRemoteEditorWindow', () => {
  const originalDocument = globalThis.document

  afterEach(() => {
    if (originalDocument === undefined) {
      // @ts-expect-error restore node env without document
      delete globalThis.document
    } else {
      globalThis.document = originalDocument
    }
  })

  function withHash(hash: string) {
    Object.defineProperty(globalThis, 'document', {
      value: {location: {hash}},
      configurable: true,
      writable: true,
    })
  }

  test('matches canonical backstage-editor hash', () => {
    withHash(REMOTE_EDITOR_HASH)
    expect(isRemoteEditorWindow()).toBe(true)
    withHash(`${REMOTE_EDITOR_HASH}?foo=1`)
    expect(isRemoteEditorWindow()).toBe(true)
  })

  test('matches legacy editor hash', () => {
    withHash(LEGACY_REMOTE_EDITOR_HASH)
    expect(isRemoteEditorWindow()).toBe(true)
    withHash(`${LEGACY_REMOTE_EDITOR_HASH}?foo=1`)
    expect(isRemoteEditorWindow()).toBe(true)
  })

  test('does not match editorial or other hashes containing "editor"', () => {
    withHash('#editorial')
    expect(isRemoteEditorWindow()).toBe(false)
    withHash('#not-editor')
    expect(isRemoteEditorWindow()).toBe(false)
    withHash('')
    expect(isRemoteEditorWindow()).toBe(false)
  })
})
