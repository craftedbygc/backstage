/**
 * One-shot import path migration: @unseenco/theatre-* → @unseenco/backstage subpaths.
 * Run from repo root: node devEnv/migrate-to-backstage-imports.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
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
])

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

const THEATRE_PKG_PREFIX = '@unseenco/theatre-'

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (SKIP_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, files)
    } else {
      const ext = path.extname(entry.name)
      if (TEXT_EXTENSIONS.has(ext)) {
        files.push(full)
      }
    }
  }
  return files
}

function migrateContent(content) {
  let out = content
  for (const [from, to] of IMPORT_REPLACEMENTS) {
    out = out.split(from).join(to)
  }
  return out
}

function consolidatePackageJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  let pkg
  try {
    pkg = JSON.parse(raw)
  } catch {
    return false
  }

  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies']
  let hadTheatre = false
  for (const depType of depTypes) {
    const deps = pkg[depType]
    if (!deps) continue
    for (const name of Object.keys(deps)) {
      if (name === '@unseenco/backstage') continue
      if (name.startsWith(THEATRE_PKG_PREFIX)) {
        delete deps[name]
        hadTheatre = true
      }
    }
  }

  if (!hadTheatre) return false

  // Published umbrella only in packages/backstage — inner workspaces link via backstage.
  const pkgName = pkg.name
  const isBackstageRoot = pkgName === '@unseenco/backstage'
  if (!isBackstageRoot && pkgName !== 'theatre-monorepo') {
    for (const depType of ['dependencies', 'devDependencies']) {
      if (!pkg[depType]) pkg[depType] = {}
      if (!pkg[depType]['@unseenco/backstage']) {
        pkg[depType]['@unseenco/backstage'] = 'workspace:*'
      }
    }
  }

  // Peer deps: single backstage peer when any theatre peer existed
  if (pkg.peerDependencies) {
    const peers = pkg.peerDependencies
    const theatrePeerKeys = Object.keys(peers).filter((k) =>
      k.startsWith(THEATRE_PKG_PREFIX),
    )
    if (theatrePeerKeys.length > 0) {
      for (const k of theatrePeerKeys) delete peers[k]
      if (!peers['@unseenco/backstage']) {
        peers['@unseenco/backstage'] = '*'
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n')
  return true
}

const files = walk(root)
let changed = 0
for (const file of files) {
  if (file.includes('migrate-to-backstage-imports.mjs')) continue
  if (path.basename(file) === 'yarn.lock') continue

  if (path.basename(file) === 'package.json') {
    if (consolidatePackageJson(file)) {
      changed++
      console.log('package.json:', path.relative(root, file))
    }
  }

  const original = fs.readFileSync(file, 'utf8')
  const migrated = migrateContent(original)
  if (migrated !== original) {
    fs.writeFileSync(file, migrated)
    changed++
  }
}

// Mark former publish packages private (except backstage)
const privatePackages = [
  'theatre/core/package.json',
  'theatre/core-lite/package.json',
  'theatre/studio/package.json',
  'theatre/studio-lite/package.json',
  'packages/dataverse/package.json',
  'packages/react/package.json',
  'packages/threejs/package.json',
  'packages/gsap/package.json',
  'packages/browser-bundles/package.json',
]
for (const rel of privatePackages) {
  const filePath = path.join(root, rel)
  const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (!pkg.private) {
    pkg.private = true
    fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n')
    console.log('private:', rel)
  }
}

console.log(`Migration touched ${changed} files.`)
