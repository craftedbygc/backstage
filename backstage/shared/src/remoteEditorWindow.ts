/** Canonical URL hash for the Studio remote editor popup. */
export const REMOTE_EDITOR_HASH = '#backstage-editor'

/** Legacy hash kept for backwards compatibility. */
export const LEGACY_REMOTE_EDITOR_HASH = '#editor'

const REMOTE_EDITOR_HASH_WITH_OPENER_PREFIX = `${REMOTE_EDITOR_HASH}=`

function hashMatchesEditorToken(hash: string, token: string): boolean {
  return (
    hash === token ||
    hash.startsWith(`${token}?`) ||
    hash.startsWith(`${token}&`) ||
    hash.startsWith(`${token}=`)
  )
}

/** Hash for opening the remote editor from a specific listener tab. */
export function formatRemoteEditorHash(openerTabId: string): string {
  return `${REMOTE_EDITOR_HASH}=${openerTabId}`
}

/**
 * Opener tab id from `#backstage-editor=<id>`. Undefined for legacy `#backstage-editor`
 * or `#editor` hashes without an id.
 */
export function parseRemoteEditorOpenerTabId(
  hash: string = typeof document !== 'undefined' ? document.location.hash : '',
): string | undefined {
  if (!hash.startsWith(REMOTE_EDITOR_HASH_WITH_OPENER_PREFIX)) {
    return undefined
  }
  const rest = hash.slice(REMOTE_EDITOR_HASH_WITH_OPENER_PREFIX.length)
  const id = rest.split(/[?&#]/)[0]
  return id.length > 0 ? id : undefined
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
