import fs from 'node:fs'
import path from 'node:path'

const packageRoot = path.join(__dirname, '..')
const monorepoRoot = path.join(packageRoot, '../..')

const distCopies: Array<{from: string; to: string}> = [
  {from: 'theatre/core/dist', to: 'dist/core'},
  {from: 'theatre/core-lite/dist', to: 'dist/core-lite'},
  {from: 'theatre/studio/dist', to: 'dist/studio'},
  {from: 'theatre/studio-lite/dist', to: 'dist/studio-lite'},
  {from: 'packages/dataverse/dist', to: 'dist/dataverse'},
  {from: 'packages/react/dist', to: 'dist/react'},
  {from: 'packages/threejs/dist', to: 'dist/threejs'},
  {from: 'packages/gsap/dist', to: 'dist/gsap'},
  {from: 'packages/browser-bundles/dist', to: 'dist/browser-bundles'},
]

function copyDir(from: string, to: string) {
  const absFrom = path.join(monorepoRoot, from)
  const absTo = path.join(packageRoot, to)
  if (!fs.existsSync(absFrom)) {
    throw new Error(
      `Missing build output at ${from}. Run component builds before backstage assemble.`,
    )
  }
  fs.rmSync(absTo, {recursive: true, force: true})
  fs.cpSync(absFrom, absTo, {recursive: true})
  console.log(`  copied ${from} → ${to}`)
}

function copyLicenseFiles() {
  const licenseCopies = [
    ['theatre/core/LICENSE', 'LICENSE-APACHE-CORE'],
    ['packages/dataverse/LICENSE', 'LICENSE-APACHE-DATAVERSE'],
    ['packages/react/LICENSE', 'LICENSE-APACHE-REACT'],
    ['theatre/studio/LICENSE', 'LICENSE-AGPL-STUDIO'],
    ['packages/threejs/LICENSE', 'LICENSE-AGPL-THREEJS'],
    ['packages/gsap/LICENSE', 'LICENSE-AGPL-GSAP'],
    ['packages/browser-bundles/LICENSE', 'LICENSE-BROWSER-BUNDLES'],
  ]
  for (const [from, name] of licenseCopies) {
    const absFrom = path.join(monorepoRoot, from)
    if (fs.existsSync(absFrom)) {
      fs.copyFileSync(absFrom, path.join(packageRoot, name))
    }
  }
  const readmeLicense = path.join(packageRoot, 'LICENSE')
  if (!fs.existsSync(readmeLicense)) {
    fs.writeFileSync(
      readmeLicense,
      `This package bundles multiple Theatre.js components under different licenses.\nSee LICENSE-* files in this directory.\n`,
    )
  }
}

console.log('Assembling @unseenco/backstage dist…')
for (const {from, to} of distCopies) {
  copyDir(from, to)
}
copyLicenseFiles()
console.log('Backstage assemble complete.')
