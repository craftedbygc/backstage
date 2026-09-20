# Authoring extensions

Studio extensions add toolbar items, panes, and custom editing tools. The API is **experimental** and may change.

## Register an extension

```ts
import studio from '@unseenco/backstage/studio'

studio.extend({
  id: 'my-extension',
  toolbars: {
    global: (set, studio) => {
      set([
        {
          type: 'Icon',
          title: 'Hello',
          svgSource: '<svg>...</svg>',
          onClick: () => console.log('clicked'),
        },
      ])
    },
  },
})
```

## Concepts

- **Global toolbar** — top-left; outline toggle plus extension icons.
- **Panes** — docked panels (`studio.extend` pane definitions).
- **Selection** — read and set Studio selection to build gizmos tied to sheet objects.

Study **`@unseenco/backstage/threejs/extension`** (`packages/threejs/src/extension`) for a full example: viewport helpers, object registry with `autoAddObject`, and orbit-mode selection sync.

## API

[Studio API](/api/backstage-studio) — search for `IExtension`, `toolbars`, and `panes`.

Legacy step-by-step tutorials with screenshots lived on the old website; port more examples here as the extension API stabilizes.
