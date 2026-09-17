# Studio

**Studio** (`@unseenco/theatre-studio`) is the visual editor. It appears only when you call `studio.initialize()`—keep that behind a development flag in production.

Toggle visibility: `Alt`/`Option` + `\`.

## Initialization

```ts
import studio from '@unseenco/theatre-studio'

studio.initialize({
  // Optional: theme Studio controls and sequencer accents
  accentHex: '#617a8d',
})
```

`accentHex` must be a CSS hex color (for example `#c026d3`).

## Main areas

1. **Outline** — projects, sheets, [sequence variants](./sheet-variants.md), namespaces, objects. See [saved vs in-memory state](#saved-vs-in-memory-state).
2. **Details Panel** — edit props for the selection. Select a **sheet** (no object) to edit [sheet-level props](./sheets.md#sheet-level-props).
3. **Sequence Editor** — timeline and dope sheet for sequenced props. Playback controls (play/pause, loop, zoom) sit above the dope sheet; `Space` toggles playback ([Keyboard shortcuts](./keyboard-shortcuts.md)).
4. **Global toolbar** — built-in controls plus extension buttons.
5. **Extension panes** — optional panels from extensions (e.g. Three.js viewport tools).
6. **GSAP clip tracks** — when you use [@unseenco/theatre-gsap](../extensions/gsap.md), registered animations appear in the outline and sequence editor as clip rows (no separate extension install).

## Saved vs in-memory state

Studio compares live edits to the **`state` object** you passed to `getProject()`. When they diverge:

- The **outline toolbar button** shows an orange warning badge.
- **Object rows** use a dirty-state circle (hollow = matches loaded JSON, filled = any static override or sequence track changed).
- Prop context menus offer **Revert to saved value** (and **Revert all to saved value** on compound props).

Re-export project JSON from the outline before shipping so runtime `{state}` matches what you authored ([Projects](./projects.md)).

## Clearing persisted browser data

Studio preferences and project animation data use separate `localStorage` keys. Clear them independently when debugging:

```ts
studio.clearStudioState() // UI prefs for this project prefix
studio.clearProjectState() // saved project JSON in the browser
```

The toolbar flyout exposes the same actions.

## Docked mode

Dock Studio to screen edges so the viewport stays uncovered—use the dock control in the global toolbar.

## Remote editor window

Cross-window editing is built into `@unseenco/theatre-core`: when a remote editor popup is open (`#editor` in the URL hash), selection, sequence position, and values sync over `BroadcastChannel`. Use **Open remote editor window** in the toolbar; the main window hides Studio UI while the popup is active.

## Export / import

Open the project row in the outline → export JSON (and asset zip when needed). Import by passing `{state}` to `getProject` ([Projects](./projects.md)).

## API

[Studio API](/api/theatre-studio)
