# With HTML / SVG

Animate DOM elements without a bundler. This tutorial uses ES modules and a CDN; the same APIs apply when you import `@unseenco/theatre-core` from npm.

## Starter HTML

Create `animation-tutorial.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Theatre tutorial</title>
    <style>
      body {
        margin: 0;
        color: white;
        background: black;
        font-family: sans-serif;
      }
    </style>
  </head>
  <body>
    <h1 id="article-heading" style="text-align: center">Welcome</h1>
    <script type="module">
      // Add JavaScript here
    </script>
  </body>
</html>
```

## Add Studio (development)

Publish `@unseenco/theatre-browser-bundles` from this monorepo, or install the packages via a bundler. For a quick CDN-style setup, import core and studio from your host (version must match your published packages).

Example with npm and Vite is preferred for real projects:

```ts
import studio from '@unseenco/theatre-studio'
import {getProject, types} from '@unseenco/theatre-core'

studio.initialize()
```

For a no-bundler experiment, load the browser bundle build of `@unseenco/theatre-browser-bundles` (see package `dist/` after `yarn cli build`) the same way legacy docs used `core-and-studio.js`.

## Project, sheet, object

```ts
const project = getProject('HTML Animation Tutorial')
const sheet = project.sheet('Sheet 1')
const obj = sheet.object('Heading 1', {
  y: 0,
  opacity: types.number(1, {range: [0, 1]}),
})
```

## Sync to the DOM

```ts
const heading = document.getElementById('article-heading')

obj.onValuesChange((values) => {
  heading.style.transform = `translateY(${values.y}px)`
  heading.style.opacity = String(values.opacity)
})
```

Tweak **y** and **opacity** in the Details Panel to confirm the link works.

## Sequence an animation

Right-click a prop in the Details Panel → **Sequence**, add keyframes on the timeline, then press `Space` to preview.

## Production checklist

1. Export **state.json** from the outline (project menu → export).
2. Load state when creating the project:

```ts
const project = getProject('HTML Animation Tutorial', {state: projectState})
```

3. Remove Studio (`studio.initialize()` and Studio imports).
4. Ship **only** `@unseenco/theatre-core` (or `core-only` browser bundle).
5. Start playback after `project.ready`:

```ts
project.ready.then(() => {
  sheet.sequence.play({iterationCount: Infinity, range: [0, 6]})
})
```

## Next steps

- [Projects](../manual/projects.md) — state, `ready`, assets
- [Prop types](../manual/prop-types.md)
