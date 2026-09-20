# Theatre.js changelog

## 0.6.0

- New features
  - **Theatre Lite:** New published packages **`@unseenco/theatre-core-lite`** (Apache-2.0 production runtime) and **`@unseenco/theatre-studio-lite`** (AGPL-3.0 dev editor). Same project ids, object keys, prop schemas, and **`OnDiskState`** JSON shape as full Theatre; lite state is a valid subset. Author **static overrides** and **sheet-level variants** (`declareSequenceVariants` / `setActiveSequenceVariant`); export/import project JSON from the outline toolbar (`createContentOfSaveFile`). Upgrade to `@unseenco/theatre-core` / `@unseenco/theatre-studio` without rewriting addresses or static layers ([guide](./docs/guide/theatre-lite/upgrading-to-full.md)).
  - **Core-lite:** `sheet.sequence` is an inert stub (`position` 0, `play()` no-op). Sequence interpolation, playback controllers, GSAP bridge, and scroll/page-mode drivers are **excluded from the lite import graph** (`CoreBundleLite`, build-time stubs), not merely gated at runtime.
  - **Studio-lite:** Outline, details, transactions, extensions, and variant folders—no Sequence Editor, keyframes, or **Sequence this prop**. Full Studio can dogfood the same UI via `studio.initialize({ mode: 'lite' })`; `@unseenco/theatre-studio-lite` always runs in lite mode.
  - **Three.js (`@unseenco/theatre-threejs`):** Optional peer entries for **`@unseenco/theatre-core-lite`** and **`@unseenco/theatre-studio-lite`** (use one core + one studio per app; do not mix lite and full in the same bundle). Runtime helpers (`autoAddObject`, etc.) and `/extension` work with either stack.
  - **Playground:** [`/shared/theatre-lite/`](./packages/playground/src/shared/theatre-lite/) (DOM static + variants), [`/shared/theatre-lite-three/`](./packages/playground/src/shared/theatre-lite-three/) (Three.js + studio-lite extension).
  - **Tooling:** `yarn workspace theatre build:js` emits lite `dist/index-lite.*` artifacts; release CLI bumps `theatre/core-lite` and `theatre/studio-lite`. Set `THEATRE_LITE_LOG_BUNDLE_SIZES=1` to print full vs lite esbuild sizes.
- Breaking changes
  - **None** for existing `@unseenco/theatre-core` / `@unseenco/theatre-studio` consumers. Theatre Lite adds new packages only; full Theatre behavior is unchanged.
- Docs
  - **Guide:** [Theatre Lite](./docs/guide/theatre-lite/) — overview, [choosing lite or full](./docs/guide/theatre-lite/choosing-lite-or-full.md), [getting started](./docs/guide/theatre-lite/getting-started.md), [variants](./docs/guide/theatre-lite/variants.md), [Three.js](./docs/guide/theatre-lite/three-js.md), [upgrading to full](./docs/guide/theatre-lite/upgrading-to-full.md). Package READMEs under `theatre/core-lite/` and `theatre/studio-lite/` include API quick reference and bundle-size tables.
- Maintenance
  - **Bundle size (esbuild, dataverse external; reproduce after `yarn workspace theatre build:js`):** `@unseenco/theatre-core-lite` ~243 KiB unminified / **~107 KiB minified** vs full core ~318 / ~139 KiB (**~24% / ~23% smaller**). `@unseenco/theatre-studio-lite` ~1602 KiB unminified / **~744 KiB minified** (published `dist`) vs full studio ~2150 / ~960 KiB (**~23% smaller, ~216 KiB minified**).

## 0.5.0

- New features
  - **Core:** **Sheet page mode** — `project.sheet(id, { sequenceMode: 'page' })` maps document scroll to a 0–100% sequencer (length 100, 10 sub-units per unit). `sheet.setSequenceMode('page' | 'time')`, one-way scroll drivers, and Studio playhead scrubbing syncs page scroll. Page mode is not persisted in exported JSON — pass sheet options on each load without Studio.
  - **Core:** Page-scroll wiring without GSAP — `configureTheatrePageScroll()`, `attachTheatrePageScroll(sheet, { driver? })`, `ISheetOptions.scrollDriver`, and optional `@unseenco/theatre-core/lenis` (`createLenisScrollDriver`). **Horizontal** page scroll via `axis: 'horizontal'`, native `scrollX`, element horizontal drivers, and matching ScrollTrigger defaults.
  - **Core / GSAP:** `project.sheet(id, { gsap: true })` attaches the GSAP sequence bridge from sheet options; keyframes and GSAP clips clamp at sequence bounds.
  - **GSAP (`@unseenco/theatre-gsap`):** **ScrollTrigger** registration (`registerGsapScrollTrigger`, `registerAllGsapScrollTriggers`) with read-only sequencer bars in page mode (vertical and horizontal), `bindGsapScrollTriggerPlugin`, and duplicate-instance warnings. `bindGsapTickerToRafDriver()` plus a one-time console warning when GSAP registration runs without the GSAP ticker driving Theatre's `rafDriver` (`configureTheatreGsap({ suppressGsapTickerRafWarning })`). `configureTheatreGsap({ pageScroll })` syncs scroll context and ScrollTrigger defaults.
  - **Studio:** Page-mode sequencer UI — percent formatter, locked length; loop/play disabled where appropriate. **TW / TL / ST** badges in outline and sequencer lists; enhanced **GsapKindBadge** SVG styling.
  - **Studio:** Read-only **GSAP details panel** — live tween/timeline/ScrollTrigger introspection (`vars`, target pills, child grouping); DOM target highlight on pill and sequencer-row hover (off-screen edge arrows when the target is outside the viewport).
  - **Studio:** Parent aggregate compound tracks render as draggable theatre-accent **span bars** (move all child keyframes; edge handles scale timing proportionally). Sheet props no longer appear as a separate **Sheet** row in the sequencer tree.
  - **Studio / Remote editor:** Debounced historic-state sync between main and remote editor windows; GSAP **element hover** highlights sync to the main preview; DOM highlight overlay renders outside the hidden Studio shell when the main UI is concealed during remote editing.
  - **Playground:** [`/shared/gsap-page-mode/`](./packages/playground/src/shared/gsap-page-mode/), [`/shared/gsap-page-mode-horizontal/`](./packages/playground/src/shared/gsap-page-mode-horizontal/), [`/shared/gsap-page-mode-lenis/`](./packages/playground/src/shared/gsap-page-mode-lenis/); updated [`/shared/gsap-time-mode/`](./packages/playground/src/shared/gsap-time-mode/).
- Bug fixes
  - **Studio:** Docked sequence pane — track column anchoring, symmetric scaled-space padding, prop-row clipping, bottom scroll slack, and docked `body` positioning so page overflow scrolls correctly.
  - **Studio:** Default sequencer zoom is fully zoomed out on first load when no persisted `clippedSpaceRange` exists (`defaultClippedSpaceRange()`).
  - **Studio:** Page-mode transport (jump start/end, step prev/next) syncs page scroll via the sheet `ScrollDriver` (manual playhead scrub already did).
  - **Studio / Remote editor:** Page-mode placeholder, ScrollTrigger layout, scroll sync, and playground GSAP registration in the remote editor shell.
  - **Shared:** Remote DOM highlight uses a package import path (`@unseenco/theatre-shared/gsap/domElementHighlightTarget`) for lint and bundler resolution.
- Docs
  - **Guide:** [Sheet sequence modes](./docs/guide/manual/sheet-modes.md) (page mode, scroll drivers, Lenis). [GSAP extension](./docs/guide/extensions/gsap.md) expanded for page mode and ScrollTrigger workflow.
  - **Links:** User-facing `theatrejs.com` / `docs.theatrejs.com` URLs point to **https://unseen-theatre.netlify.app** (`/docs/` for guides and API; site root for former homepage links) across Studio UI, core JSDoc, READMEs, and package metadata.

## 0.4.3

- Bug fixes
  - **GSAP / Core:** `attachGsapSequenceBridge()` is implemented in `@unseenco/theatre-core` (still exported from `@unseenco/theatre-gsap`) so sequence playhead sync uses the same dataverse instance as Theatre pointers — fixes `pointerToPrism` / `PointerToPrismProvider` errors in Vite/Nuxt apps without consumer-side dependency deduping.
  - **Three.js package:** Material color props are quantized before hex display in Studio so swatches match authored values more accurately.
- Maintenance
  - **Compatibility tests:** New **Vite full-stack** fixture (`vite-theatre-full-stack`) runs `vite optimize` against published `@unseenco/theatre-core`, `@unseenco/theatre-studio`, `@unseenco/theatre-gsap`, and `@unseenco/theatre-threejs/extension` (including `attachGsapSequenceBridge` at runtime).
  - **GSAP / Core publish graph:** `@unseenco/theatre-gsap` build keeps `@unseenco/*` external; core declares `@unseenco/theatre-dataverse` for bundled graph consistency.

## 0.4.0

- New features
  - **GSAP (`@unseenco/theatre-gsap`):** Sequence **time-mode** bridge for GSAP tweens and timelines (v1). `configureTheatreGsap()`, `registerGsapAnimation()`, and `attachGsapSequenceBridge()` register paused animations on sheet proxy objects under a configurable outline namespace (default `GSAP / …`), drive `progress` from the sequence playhead, and expose clip layout via `sheet.sequence.__experimental_getGsapClips()`. Optional `onRebuildTimeline` for timelines whose child spans are edited natively in Studio.
  - **Studio (GSAP):** Built-in GSAP authoring — no separate `studio.extend()` package entry. Outline and detail-panel actions **Add to sequence at playhead** / **Remove from sequence**; **GsapClipTrack** rows in the sequence editor with nested child rows for GSAP timeline children (drag/resize, baseline timing, **Reset to original state** when timing diverges). Outline labels with `/` nest in the sequence tree like other namespaces. One clip per registered animation (toggle add/remove).
  - **Core:** `GsapClipTrack` sequence track type and editors for add/update/remove GSAP clips and child timing.
  - **Playground:** [`/shared/gsap-time-mode/`](./packages/playground/src/shared/gsap-time-mode/) — DOM demo with GSAP ticker as master clock (`createRafDriver` + `setCoreRafDriver`), nested `UI / …` labels, and rebuildable timeline choreo.
  - **Three.js Package:** Multi-scene toolbar flyout shows the global unsaved-state dot on the trigger and per-scene dots when registered objects in that scene diverge from the JSON state passed to `getProject()` (`sceneSavedStateDivergence` helpers).
  - **Studio:** Outline object rows use a neutral square list icon; objects that diverge from saved project JSON show an orange **unsaved** dot on the row corner (replaces the filled/hollow dirty circle on the icon).
- Bug fixes
  - **Studio:** Keyframe diamond popover — full-width rows, hierarchy labels, aligned number/boolean/dropdown chips, full-bleed slider track in the popover, reliable anchor positioning when layout bounds are missing, and improved dismiss (outside click / shadow DOM, single open popover).
  - **Core / Studio:** Partial sheet records without `staticOverrides.byObject` no longer crash asset setup or transient-prop stripping (e.g. devtools baseline JSON before objects attach).
  - **Playground:** Three.js devtools demo loads baseline `theatre-project-state.json` into `getProject()` so unsaved indicators compare against saved state.
- Docs
  - **Guide:** [GSAP extension](./docs/guide/extensions/gsap.md) under Extensions; cross-links from concepts, extension overview, and Studio manual.
  - **API reference:** `@unseenco/theatre-gsap` included in `yarn workspace @unseenco/theatre-docs run generate:api` and VitePress sidebar (`/docs/api/theatre-gsap`).

## 0.3.0

- Maintenance
  - **CI / tooling:** GitHub Actions on **Node 22** with **actions v4**; new **Documentation site** job (`yarn docs:build`). Netlify build uses Node 22.
  - **Docs:** In-repo **VitePress** site (`docs/`) with unified `yarn build:site` deploy (`/docs/` + `/playground/`). Package API reference generated via api-extractor + api-documenter (including **dataverse** through `docs/scripts/generate-api-reference.mjs`). Removed committed TypeDoc output under `packages/dataverse/api/`.
  - **Compatibility tests:** Verdaccio publish flow includes **threejs**; primary fixture is **Vite + React 18** (`vite-react18`) with isolated `npm install` + production build. Raised Verdaccio `max_body_size` for large studio tarballs.
  - **Tooling:** TypeScript **5.3.3**, esbuild **0.25**; monorepo version alignment and release CLI publish path updates. Removed **lerna.json** (versions managed via release CLI).
  - **Examples:** `examples/basic-dom` migrated from Parcel to **Vite** (drops native **deasync** dependency that failed on Windows/modern Node).
  - **DX:** `AGENTS.md` / `CONTRIBUTING.md` refreshed; repository URL sweep to `craftedbygc/theatre`; husky pre-commit is **lint-staged** only (dataverse TypeDoc no longer regenerated on every commit).
  - **Removed:** `examples/dom-cra`, `packages/dataverse-experiments`, playground **Playwright** e2e / visual regression tests and related CI job (to be reintroduced when Studio UI stabilizes).
  - **Cleanup:** Playwright browser install removed from default CI install action; optional composite input removed with the visual-regression job.

## 0.2.3

- Bug fixes
  - Three.js Package:
    - Published `@unseenco/theatre-threejs` runtime bundle no longer imports `@unseenco/theatre-core/propTypes` or `@unseenco/theatre-shared` subpaths, fixing Vite/Nuxt dependency resolution in consumer apps.

## 0.2.2

- New features
  - Core:
    - `sheet.props(config)` — sheet-level parameters (hidden carrier object, not listed in `sheet.getObjects()`). Supports `{reconfigure: true}`, `transient`, and `static` like `sheet.object()`. The reserved sheet-props key cannot be used with `sheet.object()`.
  - Studio:
    - Outline toolbar button shows an orange warning badge when the project has diverged from the JSON state passed to `getProject()`; tooltip points users to dirty indicators on outline rows.
    - Sheet-level props editing in the details pane (sheet selected with no object), dope-sheet tree, and outline; prop labels use a dedicated sheet-props namespace.
  - Three.js Package:
    - `autoAddObject()` accepts `transient` and `static` prop paths (dot or array notation), merged with `configureTheatreThreejs()` defaults alongside existing `exclude` / `include` categories.
- Bug fixes
  - Playground:
    - Netlify static deploy of the three-basic-vanilla-devtools demo bundles `noise.jpg` via a Vite `?url` import so the texture resolves on static hosting.

## 0.2.1

- New features
  - Studio:
    - Customizable accent color via `studio.initialize({accentHex})`. Sequencer snap crosshair uses the derived accent.
    - `showPropsOf` fieldsets hide the linked object's root compound row; clicking the fieldset title opens that source object in the details pane.
    - Image prop chips match color inputs — rounded-rect preview, trash left of the swatch, click anywhere on the chip to pick a file; empty chips use a square checkerboard.
  - Three.js Package:
    - Unit-interval material scalars (`opacity`, `roughness`, `metalness`, `transmission`, and similar 0–1 factors) now use a 0–1 Studio range instead of 0–Infinity.
- Bug fixes
  - Studio:
    - Select menus stay attached to their trigger while the details pane scrolls (listen on overflow ancestors inside the shadow root rather than `window`).

## 0.2.0

- New features
  - Studio:
    - UI revamp — shared design tokens and restyled details-pane controls (number chips/sliders, toggles, strings, selects, color fields), opaque panes without blur/shadows, bordered surfaces, and keyframe edit popovers that match the chip chrome. Collapsed vector compounds show compact labeled mini-chips; accent colors derive from a single hex token.
    - Custom tween names on sequencer connector bars (Name / Edit / Clear via context menu); labels persist in project state and show in-bar with ellipsis + hover tooltip.
    - Outline sheet objects use a dirty-state circle instead of the Package icon — hollow when matching loaded JSON state, filled when any static override or sequence track has diverged.
    - Details pane prop context menu: "Revert to saved value" (and "Revert all to saved value" for compounds) when a prop has diverged from the JSON state passed to `getProject()`.
    - Touch support for drag interactions (`useDrag` via Pointer Events), including number-input scrubbing on touch devices.
  - Core:
    - Configurable number precision — project-level `numberPrecision` on `getProject()` (default 3 decimal places) and per-prop override via `types.number(default, {precision})`. Studio number inputs round and format using the resolved precision.
- Bug fixes
  - Studio:
    - Color picker no longer closes when releasing the mouse after dragging in the saturation panel.
    - Dope-sheet keyframe snap works again after pointer-capture changes in drag handling.
    - Touch number-input drag no longer cancels mid-gesture.

## 0.1.18

- New features
  - Studio:
    - Sequencer playback controls strip — play/pause, jump to start/end, step prev/next, loop toggle, close, and zoom slider are now always visible above the dope-sheet. Playhead scrubbing via click/drag on the top strip. Loop state persists across sessions (ahistoric store flag).
    - Spacebar shortcut wired to a shared `toggleSequencePlayback` helper so loop state applies to both keyboard and UI controls.
  - Studio (details pane):
    - Prop hover labels in the details pane now include the parent object name for easier identification in multi-object projects.
    - Clicking a nested sequencer prop row opens the object's details pane automatically.
- Bug fixes
  - Studio:
    - Ctrl+Z undo is no longer blocked when a checkbox input remains focused after being toggled.
    - Keyframe snap crosshair is no longer missing in built/npm studio packages (SVG `data:` URL is now quoted so esbuild inlines it correctly); snap marker resized for improved readability.
  - Playground:
    - Netlify deploy previews now trigger correctly for monorepo changes outside the playground package.
- Maintenance
  - Playground: DOM demo with JSON file–backed saved state; prop divergence indicator compares against last disk-persisted state rather than `localStorage`. Outer diamond visible when a prop diverges from saved state; unified SVG diamond indicators across sequenced and saved-state prop rows.

## 0.1.17

- New features
  - Core:
    - `ISheetObject.addProps(config)` — add new top-level props to an existing sheet object without re-specifying the full config via `sheet.object(..., {reconfigure: true})`. Existing props and their historic statics/tracks are preserved.
    - Exported project state omits static overrides that match each prop's default value (set/undo back to default no longer bloats persisted JSON).
  - Studio:
    - Studio preferences and project animation data now persist under separate localStorage keys (`{prefix}.studio` and `{prefix}.project`), with migration from the legacy combined key.
    - `studio.clearStudioState()` and `studio.clearProjectState()` clear each store independently; the toolbar uses a single flyout menu with separate clear options.
- Bug fixes
  - Studio:
    - Ease selector popover opens at the click position instead of centering on long keyframe connector lines.
    - Toolbar flyout menu SVG icons no longer render smaller than other toolbar buttons; dock toggle icon redesigned (default shape switches to overlapping windows when docked).
  - Three.js Package:
    - `buildExtension()` renderer parameter now accepts `WebGPURenderer` (via `ThreejsRenderer`); `studio` accepts real `IStudio` instances without type errors.
- Maintenance
  - Playground: Netlify config for per-PR deploy previews; custom RAF driver wired in the three devtools demo.


## 0.1.16

- Bug fixes
  - Core / Studio:
    - Published TypeScript declarations now include the public API (`types`, `getProject`, `createRafDriver`, `setCoreRafDriver`, `IRafDriver`, and other core exports). Windows builds previously treated local `.d.ts` paths as externals, so npm shipped a stub `index.d.ts` that re-exported files that are not in the package.


## 0.1.15

- New features
  - Three.js Package:
    - Multi-scene setups now hide sheets that only have registered objects in inactive scenes from the Studio outline (re-runs on scene switch and object registry changes).
- Bug fixes
  - Three.js Package:
    - Selecting an empty `Object3D` in orbit mode now shows a minimum-size yellow `BoxHelper` (previously invisible because the object has no dimensions).


## 0.1.14

- Bug fixes
  - Three.js Package:
    - Texture / image props from `autoAddObject` / `autoAddMaterial` only reload when the image asset id actually changes, so editing other material props no longer re-fetches (and 404s) the existing map.
    - Preloaded textures now register their original image URL as the Theatre image prop default; `getAssetUrl` passes direct URLs through so the details-pane preview loads the real texture instead of a basename under the asset `baseUrl`.


## 0.1.13

- Bug fixes
  - Three.js Package:
    - `autoAddObject` / `autoAddMaterial` no longer throw when shader number uniforms omit a `gui` options object (`opts.range` was being passed as `undefined` into `types.number()`).


## 0.1.12

- New features
  - Three.js Package:
    - `buildExtension()` now exposes `switchScene(nameOrIndex)` and `getActiveSceneName()` so apps can drive scene changes outside the toolbar flyout (same persist / side effects / `onSceneSwitch` path as the flyout).



## 0.1.11

- New features
  - **`showPropsOf`** — embed another sheet object's props in an object's Studio details pane (UI-only; edits and sequencing still target the source object).
    - `sheet.object(key, props, { showPropsOf: [other] })` or retroactive `object.showPropsOf([other])` / `object.getShowPropsOf()`
    - Linked props render in fieldset sections titled with the source object key
    - Playground demo: [`packages/playground/src/shared/show-props-of`](./packages/playground/src/shared/show-props-of) (`/shared/show-props-of/`)
  - **`object.reconfigure(config, opts?)`** — replace an object's prop config after creation; historic statics/tracks for removed props are stripped
  - Three.js Package:
    - `autoAddMaterial()` — register a Three.js `Material` on a sheet (material props only; no transforms / selection registry)
    - **Shared-material auto-split** — when a second `autoAddObject` uses the same `Material` instance, material props are moved to a dedicated object under `Shared Materials / <name>`, both meshes link via `showPropsOf`, and the first mesh stops applying material locally. Unnamed materials warn and fall back to a UUID-based key; pass `trackMaterial: false` to opt out, or call `autoAddMaterial` first to own the material object
    - Devtools playground: InstancedMesh sphere grid and shared-material meshes exercising auto-split (`/shared/three-basic-vanilla-devtools/`)



## 0.1.10

- New features
  - **List / unload sheets and objects** — runtime APIs to enumerate and tear down loaded sheets/objects without clearing persisted project state. Re-calling `project.sheet()` / `sheet.object()` recreates instances that pick up existing overrides and sequence data.
    - `project.getSheets()` / `sheet.getObjects()` — list currently loaded instances
    - `sheet.unload()` — detach all objects, pause sequences, remove the sheet instance
    - `project.unloadSheet(sheetId, instanceId?)` — unload one sheet (all instances if `instanceId` is omitted)
    - `project.unloadSheets()` — unload every loaded sheet
    - Existing `sheet.detachObject(key)` remains for per-object detach after listing
  - Playground demo: [`packages/playground/src/shared/unload-sheets`](./packages/playground/src/shared/unload-sheets) (`/shared/unload-sheets/`)
- Bug fixes
  - Three.js Package:
    - Fixed orbit-mode selection sync when using the split runtime / `/extension` entries: `autoAddObject` and `buildExtension` again share the same Object3D ↔ sheet-object registry (outline BoxHelper and viewport click-to-select).



## 0.1.9

- New features
  - Three.js Package:
    - `buildExtension()` accepts optional `onSceneSwitch` / `onOrbitModeSwitch` config callbacks, registered before persisted state restore so apps can react to the load-time orbit/scene value. Returned `onSceneSwitch()` / `onOrbitModeSwitch()` methods still support late subscribers for subsequent changes.
- Bug fixes
  - Three.js Package:
    - `dispose()` now detaches extension sheet objects from the Studio project so they do not linger after teardown.



## 0.1.8

- Bug fixes
  - Three.js Package:
    - Importing runtime helpers (`autoAddObject`, `autoAddCamera`, `configureTheatreThreejs`, …) from `@unseenco/theatre-threejs` no longer loads `@unseenco/theatre-studio`. `buildExtension()` moved to `@unseenco/theatre-threejs/extension` (breaking for anyone importing it from the package root). Studio is now an optional peer dependency.



## 0.1.7

- New features
  - Three.js Package:
    - `buildExtension()` now exposes `isOrbitMode()` and `onOrbitModeSwitch(callback)` so apps can react when the orbit/scene camera toggle changes.
- Bug fixes
  - Three.js Package:
    - `autoAddObject()` no longer clears existing procedural textures (e.g. `DataTexture`) when Theatre has no image asset for a texture slot.



## 0.1.6

- New features
  - Three.js Package:
    - `buildExtension()` orbit camera now copies `near` / `far` from the active scene camera and supports syncing from an `OrthographicCamera` as well as a `PerspectiveCamera`.
- Maintenance
  - Published packages now ship dual CJS + ESM builds with `exports` maps (`@unseenco/theatre-core`, `@unseenco/theatre-studio`, `@unseenco/theatre-dataverse`, `@unseenco/theatre-react`, `@unseenco/theatre-threejs`). This lets Vite/Nuxt resolve the ESM entry and share peer dependencies such as `three` instead of nesting a second copy during CJS prebundling.



## 0.1.5

- Bug fixes
  - Fixed `@unseenco/theatre-threejs` importing remote-editor helpers from an unpublished `@unseenco/theatre-studio/remoteEditor` subpath; it now imports from `@unseenco/theatre-studio`.



## 0.1.4

- New features
  - **Static and transient props** — `sheet.object()` accepts `static` and `transient` prop path options. Static props are saved in project state but cannot be keyframed; transient props are session-only and excluded from exported state JSON. The Studio detail panel shows indicators for both.
  - Three.js Package:
    - `configureTheatreThreejs()` — set project-wide defaults for `autoAddObject` exclude/include options (merged with per-call options).
    - `autoAddObject()` — register Three.js `Object3D` instances on a Theatre sheet with auto-parsed transform, material, shader uniform, and texture props. Texture slots and shader uniform textures are transient image props (session-only). Shader uniforms support optional `gui` metadata (`min`/`max`/`step`, `type: 'texture'`).
    - `autoAddCamera()` — register a Three.js `Camera` with transform and camera props (focal length, near, far, zoom); includes a viewport selection hitbox for orbit-mode picking.
    - **Three.js orbit-mode tools** — camera frustum helper, line overlays for scene lines and `userData` curves, and interactive transform controls (gizmo edits write back to the sheet as undoable scrubs). Toolbar toggles persist per scene.
    - **Bidirectional selection sync** — when `autoAddObject()` and `buildExtension()` are used together, clicking a registered mesh in the viewport selects it in the outline; outline selection shows a `BoxHelper` in orbit mode.
- Bug fixes
  - Improved `DefaultValueIndicator` color transparency in the Studio detail panel.



## 0.1.3

- New features
  - **Docked mode** — dock the Studio UI to the edges of the screen so the viewport remains uncovered.
  - `@unseenco/theatre-threejs` — new Studio extension package for Three.js scenes: orbit/scene camera toggle, multi-scene toolbar flyout with per-scene persisted devtools state, and remote-editor isolation (main window stays on scene camera while the popup edits in orbit mode). See the [package README](./packages/threejs/README.md).
  - **Outline visibility API** — `visible: false` on `project.sheet()` and `sheet.object()` keeps extension internals out of the Studio outline.
  - **Studio UI polish** — chordial tooltips and context menus; improved editor popovers; switch toolbar selected state matches pin button styling.
  - Sequence variant folders are hidden in the Studio project outline (sheets list) to reduce clutter.
- Bug fixes
  - Fixed collapsible sections in the vector prop editor.



## 0.1.2

- Maintenance
  - Release CLI publishing refactored to use Yarn.



## 0.1.1

- Maintenance
  - Repository URLs updated in package manifests for the Unseen Studio fork.
  - Enhanced CLI functionality for npm publishing.



## 0.1.0

Initial release of the [Unseen Studio fork](https://github.com/craftedbygc/theatre). Packages are published under the `@unseenco` npm scope.

- New features
  - **Sheet variants** — sheets can declare multiple sheet variants (e.g. `default`, `mobile`, `desktop`) via `sheet.declareSequenceVariants()`. Each variant has independent sequence data, so the same properties can be animated differently per variant without duplicating sheets. Runtime: `sheet.setActiveSequenceVariant()` switches which variant drives prop values; `onValuesChange` now receives a second argument `{variant}`. Studio: variant folders in the outline panel, per-variant static props, opt-in variant objects via context menu.
  - **Built-in remote editor sync** — cross-window editing is baked into `@unseenco/theatre-core` with no opt-in API. When a remote editor window is open (`#editor` in the URL hash), sheet object values, selection, and sequence position mirror automatically over `BroadcastChannel`. Studio adds an "Open remote editor window" button to the global toolbar; the main window's Studio UI hides while the remote editor is open and restores when it closes. Project state is pushed to other windows on disconnect.
  - **Custom core RAF driver** — exported `setCoreRafDriver()` so the core ticker can be driven from an external animation loop.
  - **Collapsed outline folders** — `sheet.declareOutlineNamespace(path, {collapsed})` declares a folder ahead of time (even when empty) and sets its default collapsed state; `sheet.setOutlineNamespaceCollapsed(path, collapsed)` forces a folder collapsed/expanded on load.
  - **Resizable details panel** — the detail panel can be resized by dragging its edge.
  - **Toggle timeline** — a toolbar button pins/unpins the sequence editor (timeline) panel.
  - **Non-undoable transactions** — `studio.transaction(fn, {undoable: false})` persists changes without recording them in undo history.
- Breaking changes
  - Package scope renamed from `@theatre/*` to `@unseenco/theatre-*` (e.g. `@unseenco/theatre-core`, `@unseenco/theatre-studio`).
  - Removed `@theatre/r3f`, `@theatre/remote`, `@theatre/theatric`, and the `benchmarks` workspace package.
  - Removed Studio update-checking UI and logic.



## Previous Theatre Versions



## 0.4.5

- New features
  - `sequence.attachAudio()` now uses an internal `[GainNode](https://developer.mozilla.org/en-US/docs/Web/API/GainNode)` that you can customize by connecting it to your own audio graph. Docs [here](https://unseen-theatre.netlify.app/docs/guide/manual/audio).



## 0.4.4

- New features
  - Implemented [@unseenco/theatre-browser-bundles](https://www.npmjs.com/package/@unseenco/theatre-browser-bundles), a custom build of Theatre.js that can be used via a `<script>` tag and a CDN. This should enable Theatre.js to be used in CodePen or projects that don't use a bundler.



## 0.4.3

- New features
  - `sequence.attachAudio()` now [accepts](https://github.com/craftedbygc/theatre/commit/3f0556b9eb66a0893b43e38a3ee889e13d3a6667) any `AudioNode` as destination.
  - Implemented `studio.createContentOfSaveFile()` for programmatically exporting the project's state.



## 0.4.2

- New features
  - `sequence.attachAudio` now handles autoplay blocking ([Docs](https://unseen-theatre.netlify.app/docs/guide/manual/audio#attachaudio)).
  - `studio.selection` and co have a more [lax](https://github.com/craftedbygc/theatre/commit/dcf90983a565e585661b631b457a807eb4a4d874) type constraint.
- Bug fixes
  - Fixed the builds of internal examples.



## 0.4.1

- Bug fixes
  - [Fixed](https://github.com/craftedbygc/theatre/commit/fe4010c2c64626029a26e29b9ad9104df9c56ad4) the jumping issue with `sequence.play({range})`.
  - [Fixed](https://github.com/craftedbygc/theatre/commit/769eefb5e521c8206152b0e23937d5a3cd872b8b) a typo in the `dependencies` field, thanks [Nikhil Saraf](https://github.com/nksaraf)!

