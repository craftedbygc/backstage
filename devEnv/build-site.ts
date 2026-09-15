/**
 * Builds a unified static site for Netlify: deploy/docs (VitePress) + deploy/playground (Vite MPA).
 */
import {$, fs, path} from '@cspotcode/zx'

const repoRoot = path.join(__dirname, '..')
const deployDir = path.join(repoRoot, 'deploy')
const docsDist = path.join(repoRoot, 'docs', '.vitepress', 'dist')
const playgroundDist = path.join(repoRoot, 'packages', 'playground', 'build')

async function main() {
  await fs.remove(deployDir)

  console.log('Building API docs (VitePress)…')
  await $`yarn workspace @unseenco/theatre-docs run build`

  console.log('Building playground (Vite MPA)…')
  await $`yarn workspace playground run build`

  await fs.copy(docsDist, path.join(deployDir, 'docs'))
  await fs.copy(playgroundDist, path.join(deployDir, 'playground'))

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Theatre.js</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        max-width: 40rem;
        margin: 3rem auto;
        padding: 0 1rem;
        line-height: 1.5;
      }
      a {
        display: block;
        margin: 0.5rem 0;
      }
    </style>
  </head>
  <body>
    <h1>Theatre.js</h1>
    <p>Monorepo static site (Netlify).</p>
    <nav>
      <a href="/docs/">API documentation</a>
      <a href="/playground/">Playground demos</a>
    </nav>
  </body>
</html>
`
  await fs.writeFile(path.join(deployDir, 'index.html'), indexHtml)

  console.log(`Site ready at ${deployDir}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
