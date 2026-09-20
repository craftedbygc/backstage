# Upgrading lite to full Theatre

Theatre Lite is designed so you can ship static JSON first and adopt timelines later without rewriting object addresses or prop schemas.

## 1. Swap dependencies

At the same monorepo version line:

```bash
yarn remove @unseenco/backstage/core-lite @unseenco/backstage/studio-lite
yarn add @unseenco/backstage @unseenco/backstage/studio
```

Update imports:

```ts
import {getProject, types} from '@unseenco/backstage'
import studio from '@unseenco/backstage/studio'
```

If you use Three.js, point peers at full core/studio; keep `@unseenco/backstage/threejs` unchanged.

## 2. Keep application code mostly the same

These stay identical:

- Project id and `getProject('My App', { state: json })`
- `project.sheet()`, `sheet.object(key, props)`, `sheet.props()`
- `declareSequenceVariants`, `setActiveSequenceVariant`, `onValuesChange`
- `studio.initialize()`, outline export/import

Remove any reliance on lite’s inert `sheet.sequence` stub if you start calling `sheet.sequence.play()` for real.

## 3. Open state in full Studio

Load the JSON you exported from studio-lite (or from full Studio with only static data). Static overrides and `staticOverridesByVariant` carry over. Variant folders match the ids you declared in code.

Add sequences when ready: select a prop → **Sequence** in the Details Panel ([Sequences](../manual/sequences.md)). Existing static values become the starting point for keyframes.

## 4. Variants and timelines

Full Theatre can attach a **separate timeline per variant** (`sequencesById[variantId]`). Lite-only projects have empty or stripped sequence data; you can build per-variant timelines after upgrade without migrating static layers.

Keep calling `declareSequenceVariants([...])` with the same ids.

## 5. Production bundle

Strip `@unseenco/backstage/studio` from production as you would today; ship `@unseenco/backstage` with `{ state }` and real sequence playback when needed.

## Related

- [Overview](./index.md)
- [Choosing lite or full](./choosing-lite-or-full.md)
- [Projects](../manual/projects.md)
