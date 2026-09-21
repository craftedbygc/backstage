/**
 * Builds a unified static site for Netlify: deploy/ (Astro landing) + deploy/docs (VitePress) + deploy/playground (Vite MPA).
 */
import {$, fs, path} from '@cspotcode/zx'

if (process.platform === 'win32') {
  $.shell = 'cmd.exe'
  $.prefix = ''
}

const repoRoot = path.join(__dirname, '..')
const deployDir = path.join(repoRoot, 'deploy')
const siteDist = path.join(repoRoot, 'site', 'dist')
const docsDist = path.join(repoRoot, 'docs', '.vitepress', 'dist')
const playgroundDist = path.join(repoRoot, 'packages', 'playground', 'build')

async function main() {
  await fs.remove(deployDir)

  console.log('Building landing site (Astro)…')
  await $`yarn workspace @unseenco/backstage-site run build`
  await fs.copy(siteDist, deployDir)

  console.log('Building API docs (VitePress)…')
  await $`yarn workspace @unseenco/backstage-docs run build`

  console.log('Building playground (Vite MPA)…')
  await $`yarn workspace playground run build`

  await fs.copy(docsDist, path.join(deployDir, 'docs'))
  await fs.copy(playgroundDist, path.join(deployDir, 'playground'))

  console.log(`Site ready at ${deployDir}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
