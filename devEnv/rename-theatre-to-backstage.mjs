/**
 * Repo-wide Theatre → Backstage rename (paths + content).
 * Run from repo root: node devEnv/rename-theatre-to-backstage.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import {execSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.temp',
  '.yarn',
  'deploy',
])

const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.html',
  '.css',
  '.svg',
])

function gitMv(from, to) {
  const fromAbs = path.join(root, from)
  const toAbs = path.join(root, to)
  if (!fs.existsSync(fromAbs)) {
    console.warn('skip missing:', from)
    return
  }
  fs.mkdirSync(path.dirname(toAbs), {recursive: true})
  execSync(`git mv ${JSON.stringify(fromAbs)} ${JSON.stringify(toAbs)}`, {
    cwd: root,
    stdio: 'inherit',
  })
}

function renamePaths() {
  gitMv('theatre', 'backstage')
  gitMv('docs/guide/theatre-lite', 'docs/guide/backstage-lite')
  gitMv(
    'packages/playground/src/shared/theatre-lite',
    'packages/playground/src/shared/backstage-lite',
  )
  gitMv(
    'packages/playground/src/shared/theatre-lite-three',
    'packages/playground/src/shared/backstage-lite-three',
  )
  gitMv(
    'compat-tests/fixtures/vite-theatre-full-stack',
    'compat-tests/fixtures/vite-backstage-full-stack',
  )

  const fileRenames = [
    [
      'backstage/core/src/projects/TheatreProject.ts',
      'backstage/core/src/projects/BackstageProject.ts',
    ],
    [
      'backstage/core/src/sheets/TheatreSheet.ts',
      'backstage/core/src/sheets/BackstageSheet.ts',
    ],
    [
      'backstage/core/src/sheetObjects/TheatreSheetObject.ts',
      'backstage/core/src/sheetObjects/BackstageSheetObject.ts',
    ],
    [
      'backstage/core/src/sequences/TheatreSequence.ts',
      'backstage/core/src/sequences/BackstageSequence.ts',
    ],
    [
      'backstage/core/src/sequences/TheatreSequenceLite.ts',
      'backstage/core/src/sequences/BackstageSequenceLite.ts',
    ],
    [
      'backstage/studio/src/TheatreStudio.ts',
      'backstage/studio/src/BackstageStudio.ts',
    ],
    [
      'backstage/core/src/sheets/theatrePageScroll.ts',
      'backstage/core/src/sheets/backstagePageScroll.ts',
    ],
    [
      'backstage/core/src/theatreLiteRuntimeFlag.ts',
      'backstage/core/src/backstageLiteRuntimeFlag.ts',
    ],
    [
      'backstage/core/src/utils/isTheatreLiteMode.ts',
      'backstage/core/src/utils/isBackstageLiteMode.ts',
    ],
    [
      'backstage/core/src/theatreLite.test.ts',
      'backstage/core/src/backstageLite.test.ts',
    ],
    [
      'backstage/studio/src/utils/theatreLiteMode.ts',
      'backstage/studio/src/utils/backstageLiteMode.ts',
    ],
    [
      'backstage/studio/src/utils/theatreLiteMode.test.ts',
      'backstage/studio/src/utils/backstageLiteMode.test.ts',
    ],
    [
      'packages/gsap/src/attachTheatrePageScroll.ts',
      'packages/gsap/src/attachBackstagePageScroll.ts',
    ],
    [
      'packages/playground/devEnv/theatreLiteThreeVitePlugin.ts',
      'packages/playground/devEnv/backstageLiteThreeVitePlugin.ts',
    ],
    [
      'packages/playground/src/theatreLiteThreeVitePlugin.test.ts',
      'packages/playground/src/backstageLiteThreeVitePlugin.test.ts',
    ],
    [
      'compat-tests/fixtures/vite-backstage-full-stack/vite-theatre-full-stack.compat-test.ts',
      'compat-tests/fixtures/vite-backstage-full-stack/vite-backstage-full-stack.compat-test.ts',
    ],
  ]

  for (const [from, to] of fileRenames) {
    gitMv(from, to)
  }

  const globWalk = (dir, acc = []) => {
    if (!fs.existsSync(dir)) return acc
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      if (SKIP_DIRS.has(entry.name)) continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) globWalk(full, acc)
      else if (entry.name.includes('.theatre-project-state.json')) {
        acc.push(full)
      }
    }
    return acc
  }

  for (const full of globWalk(root)) {
    const rel = path.relative(root, full)
    const next = rel.replace(/\.theatre-project-state\.json$/, '.backstage-project-state.json')
    if (next !== rel) gitMv(rel, next)
  }
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (SKIP_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else {
      const ext = path.extname(entry.name)
      if (TEXT_EXTENSIONS.has(ext) || entry.name === 'AGENTS.md') {
        files.push(full)
      }
    }
  }
  return files
}

const PLACEHOLDERS = [
  ['theatre-js', '@@PH_ORG_THEATREJS@@'],
  ['unseen-theatre', '@@PH_HOST_UNSEEN@@'],
  ['craftedbygc/theatre', '@@PH_REPO_CBGC@@'],
]

function migrateContent(content, relPath) {
  if (relPath === 'CHANGELOG.md') {
    return content
  }

  let out = content

  if (relPath === 'README.md') {
    const lines = out.split('\n')
    const head = lines.slice(0, 10).join('\n')
    let tail = lines.slice(10).join('\n')
    tail = applyReplacements(tail)
    return head + (lines.length > 10 ? '\n' + tail : '')
  }

  return applyReplacements(out)
}

const IMPORT_REPLACEMENTS = [
  ['@unseenco/theatre-threejs/extension', '@unseenco/backstage/threejs/extension'],
  ['@unseenco/theatre-studio-lite', '@unseenco/backstage/studio-lite'],
  ['@unseenco/theatre-core-lite', '@unseenco/backstage/core-lite'],
  ['@unseenco/theatre-studio', '@unseenco/backstage/studio'],
  ['@unseenco/theatre-core', '@unseenco/backstage'],
  ['@unseenco/theatre-dataverse', '@unseenco/backstage/dataverse'],
  ['@unseenco/theatre-react', '@unseenco/backstage/react'],
  ['@unseenco/theatre-threejs', '@unseenco/backstage/threejs'],
  ['@unseenco/theatre-gsap', '@unseenco/backstage/gsap'],
  ['@unseenco/theatre-browser-bundles', '@unseenco/backstage/browser-bundles'],
]

function applyReplacements(content) {
  let out = content

  for (const [from, to] of IMPORT_REPLACEMENTS) {
    out = out.split(from).join(to)
  }

  for (const [from, ph] of PLACEHOLDERS) {
    out = out.split(from).join(ph)
  }

  out = out.split('theatre.js').join('backstage.js')
  out = out.split('Theatre.js').join('Backstage.js')

  out = out.split('Theatre').join('Backstage')

  out = out.split('THEATRE_').join('BACKSTAGE_')
  out = out.split('__THEATRE_LITE__').join('__BACKSTAGE_LITE__')
  out = out.split('__TheatreJS_').join('__BackstageJS_')

  out = out.split('window.Theatre').join('window.Backstage')

  out = out.split('theatre').join('backstage')
  out = out.split('THEATRE').join('BACKSTAGE')

  for (const [from, ph] of PLACEHOLDERS) {
    if (from === 'craftedbygc/theatre') {
      out = out.split(ph).join('craftedbygc/backstage')
    } else {
      out = out.split(ph).join(from)
    }
  }

  return out
}

function stripTheatreTsconfigAliases() {
  const file = path.join(root, 'tsconfig.base.json')
  let raw = fs.readFileSync(file, 'utf8')
  raw = applyReplacements(raw)
  const json = JSON.parse(raw)
  const paths = json.compilerOptions.paths
  for (const key of Object.keys(paths)) {
    if (key.startsWith('@unseenco/theatre-')) {
      delete paths[key]
    }
  }
  fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n')
}

function removeTheatrejsEmailFromPackageJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  let pkg
  try {
    pkg = JSON.parse(raw)
  } catch {
    return
  }
  let changed = false
  if (typeof pkg.author === 'string' && pkg.author.includes('theatrejs.com')) {
    delete pkg.author
    changed = true
  }
  if (pkg.author && typeof pkg.author === 'object' && pkg.author.email) {
    if (String(pkg.author.email).includes('theatrejs.com')) {
      delete pkg.author.email
      changed = true
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n')
  }
}

function migrateFiles() {
  const files = walk(root)
  let touched = 0
  for (const full of files) {
    const rel = path.relative(root, full)
    if (rel === 'devEnv/rename-theatre-to-backstage.mjs') continue
    const before = fs.readFileSync(full, 'utf8')
    const after = migrateContent(before, rel)
    if (after !== before) {
      fs.writeFileSync(full, after)
      touched++
    }
    if (full.endsWith('package.json')) {
      removeTheatrejsEmailFromPackageJson(full)
    }
  }
  console.log(`Content migration touched ${touched} files`)
}

function updateChangelog() {
  const file = path.join(root, 'CHANGELOG.md')
  let content = fs.readFileSync(file, 'utf8')
  if (content.startsWith('# Theatre.js changelog')) {
    content =
      '# Backstage.js changelog\n\n' +
      '## Unreleased\n\n' +
      '- **Breaking:** Public API symbols renamed from `Theatre*` to `Backstage*` (projects, sheets, sequences, studio types, GSAP/Three.js helpers, lite mode flags). Browser bundle global is `window.Backstage`. Compile-time flags use `BACKSTAGE_*` / `__BACKSTAGE_LITE__` / `__BackstageJS_*`.\n' +
      '- **Breaking:** Monorepo workspace root moved from `theatre/` to `backstage/`; saved project state files use `.backstage-project-state.json`. Legacy `@unseenco/theatre-*` TypeScript path aliases removed from `tsconfig.base.json` (use `@unseenco/backstage/*`).\n' +
      '- **Docs:** User-facing guides and playground routes use `backstage-lite` paths; GitHub metadata references `craftedbygc/backstage`.\n\n' +
      content.slice('# Theatre.js changelog'.length).trimStart()
    fs.writeFileSync(file, content)
  }
}

const args = new Set(process.argv.slice(2))
const runAll = args.size === 0

if (runAll || args.has('--paths')) {
  console.log('=== Path renames ===')
  renamePaths()
}

if (runAll || args.has('--content')) {
  console.log('=== Content migration ===')
  migrateFiles()
  stripTheatreTsconfigAliases()
  updateChangelog()
}

console.log('Done.')
