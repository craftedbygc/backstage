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
    demoRoot.style.display = 'none'
  }

  if (document.getElementById(REMOTE_EDITOR_PLACEHOLDER_ID)) {
    return
  }

  const overlay = document.createElement('div')
  overlay.id = REMOTE_EDITOR_PLACEHOLDER_ID
  overlay.setAttribute('role', 'status')
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;margin:0;font:600 1rem/1.4 system-ui,sans-serif;color:#e8e8ea;background:#0f1115;text-align:center;padding:2rem;pointer-events:none;'

  const message = document.createElement('p')
  message.textContent = REMOTE_EDITOR_PLACEHOLDER
  message.style.margin = '0'
  overlay.appendChild(message)
  document.body.appendChild(overlay)
}
