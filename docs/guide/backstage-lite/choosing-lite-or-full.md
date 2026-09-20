# Choosing lite or full

Pick the stack that matches how you ship animation—not just how you author during development.

## Decision table

| Need | Full Backstage | Backstage Lite |
| --- | --- | --- |
| Timelines & keyframes on props | Yes | No |
| `sheet.sequence.play()` / scrubbing in production | Yes | No (stub only) |
| GSAP bridge / clip tracks in Studio | Yes | No |
| Page scroll or other [sequence modes](../manual/sheet-modes.md) | Yes | No |
| Static prop values + export JSON | Yes | Yes (primary workflow) |
| Per-sheet **variants** (breakpoint layouts, quality tiers) | Yes (static + per-variant timelines) | Yes (**static overrides only**) |
| Smaller production bundle (no interpolation/playback code) | No | Yes |
| Open same JSON in full Studio later and add sequences | — | Yes |

## Static + variants JSON workflow (lite sweet spot)

1. **Develop** with `@unseenco/backstage/studio-lite` and `@unseenco/backstage/core-lite` (or studio-lite on full core while prototyping).
2. Author static values and variant folders in the outline; export project JSON from the outline toolbar.
3. **Ship** with `getProject(id, { state })` and **no** studio package in the bundle.
4. At runtime, call `declareSequenceVariants` with the same ids you used in Studio, then `setActiveSequenceVariant` when breakpoints or prefs change.
5. Wire `onValuesChange` (or Three.js `autoAddObject`) to apply values.

If you later need one prop to animate over time, migrate to full packages—the exported state stays compatible ([Upgrading to full](./upgrading-to-full.md)).

## When full Backstage is the better default

- Marketing sites with hero timelines, choreographed UI, or audio-synced motion.
- Games or tools that scrub or loop sequences from code.
- Teams already using [@unseenco/backstage/gsap](../extensions/gsap.md) or scroll-driven sheets.

## When lite fits

- Design-system-driven UIs: spacing, colors, copy, layout per variant.
- Three.js scenes where transforms/materials are **tweaked statically** per variant, not keyframed.
- Production bundles where every KiB of sequence machinery matters.

See [Overview](./index.md) for package names and licenses.
