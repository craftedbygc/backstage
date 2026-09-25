/** Canonical URL hash for the Studio remote editor popup. */
export const REMOTE_EDITOR_HASH = '#backstage-editor'

/** Legacy hash kept for backwards compatibility. */
export const LEGACY_REMOTE_EDITOR_HASH = '#editor'

function hashMatchesEditorToken(hash: string, token: string): boolean {
  return (
    hash === token ||
    hash.startsWith(`${token}?`) ||
    hash.startsWith(`${token}&`)
  )
}

/**
 * True when this window is the cross-window Studio remote editor (popup).
 * Matches `#backstage-editor` and legacy `#editor`, but not unrelated hashes
 * like `#editorial`.
 */
export function isRemoteEditorWindow(): boolean {
  if (typeof document === 'undefined') return false
  const hash = document.location.hash
  if (hashMatchesEditorToken(hash, REMOTE_EDITOR_HASH)) return true
  if (hashMatchesEditorToken(hash, LEGACY_REMOTE_EDITOR_HASH)) return true
  return false
}
