import {isRemoteEditorWindow} from '@unseenco/theatre-core'

const REMOTE_EDITOR_PLACEHOLDER =
  'Remote editor — preview in main window'

/** True when this tab is the Studio remote editor popup (`#editor` hash). */
export function isRemotePageModeEditorWindow(): boolean {
  return isRemoteEditorWindow()
}

/** Strip demo markup so page scroll / GSAP hooks do not run in the remote editor. */
export function replaceBodyWithRemoteEditorPlaceholder(): void {
  document.body.replaceChildren()
  const message = document.createElement('p')
  message.textContent = REMOTE_EDITOR_PLACEHOLDER
  message.style.cssText =
    'margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font:600 1rem/1.4 system-ui,sans-serif;color:#e8e8ea;background:#0f1115;text-align:center;padding:2rem;'
  document.body.appendChild(message)
}
