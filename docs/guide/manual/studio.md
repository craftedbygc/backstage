# Studio

**Studio** (`@unseenco/theatre-studio`) is the visual editor. It appears only when you call `studio.initialize()`—keep that behind a development flag in production.

Toggle visibility: `Alt`/`Option` + `\`.

## Main areas

1. **Outline** — projects, sheets, namespaces, objects. An **unsaved** badge appears when in-memory state differs from the `state` object passed to `getProject()`.
2. **Details Panel** — edit props for the selection.
3. **Sequence Editor** — timeline and dope sheet for sequenced props.
4. **Global toolbar** — built-in controls plus extension buttons.
5. **Extension panes** — optional panels from extensions (e.g. Three.js viewport tools).

## Export / import

Open the project row in the outline → export JSON (and asset zip when needed). Import by passing `{state}` to `getProject` ([Projects](./projects.md)).

## API

[Studio API](/api/theatre-studio)
