import {isRemoteEditorWindow} from '@unseenco/theatre-core'

const REMOTE_EDITOR_PLACEHOLDER =
  'Remote editor — preview in main window'

const REMOTE_EDITOR_PLACEHOLDER_ID = 'remote-editor-placeholder'

/** True when this tab is the Studio remote editor popup (`#editor` hash). */
export function isRemotePageModeEditorWindow(): boolean {
  return isRemoteEditorWindow()
}

/**
 * Hide demo markup in the remote editor while keeping DOM nodes so Theatre/GSAP
 * registration can target the same elements as the main window.
 */
export function hidePageModeDemoForRemoteEditor(): void {
  const demoRoot = document.getElementById('demo-root')
  if (demoRoot) {
    // Keep layout in the document so page scroll metrics stay non-zero for ST
    // layout in the remote editor (display:none collapses scroll height to 0).
    demoRoot.style.visibility = 'hidden'
    demoRoot.style.pointerEvents = 'none'
    demoRoot.style.userSelect = 'none'
  }

  if (document.getElementById(REMOTE_EDITOR_PLACEHOLDER_ID)) {
    return
  }

  const overlay = document.createElement('div')
  overlay.id = REMOTE_EDITOR_PLACEHOLDER_ID
  overlay.setAttribute('role', 'status')
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:-1;display:flex;align-items:center;justify-content:center;margin:0;font:600 1rem/1.4 system-ui,sans-serif;color:#e8e8ea;background:#0f1115;text-align:center;padding:2rem;pointer-events:none;'

  const message = document.createElement('p')
  message.textContent = REMOTE_EDITOR_PLACEHOLDER
  message.style.margin = '0'
  overlay.appendChild(message)
  document.body.appendChild(overlay)
}
