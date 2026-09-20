/**
 * Builds api-extractor doc models for Backstage public packages and runs
 * @microsoft/api-documenter to emit Markdown under docs/api/ (served at /docs/api/).
 */
import {execSync} from 'node:child_process'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {fixApiDocumenterMarkdownFiles} from './fix-api-documenter-markdown.mjs'

const docsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const root = path.resolve(docsDir, '..')

function run(command, options = {}) {
  execSync(command, {
    cwd: root,
    stdio: 'inherit',
    env: {...process.env, ...options.env},
  })
}

console.log('Building TypeScript declarations for @unseenco/backstage and studio…')
run('yarn workspace backstage run build:ts')

console.log('Generating api-extractor doc models (core, studio)…')
run('yarn workspace backstage run build:api-json')

console.log('Building @unseenco/backstage/threejs (types + api model)…')
run('yarn workspace @unseenco/backstage-threejs run build:ts')
run('yarn workspace @unseenco/backstage-threejs run build:api-json')

console.log('Building @unseenco/backstage/dataverse (types + api model)…')
run('yarn workspace @unseenco/backstage-dataverse run build:ts')
run('yarn workspace @unseenco/backstage-dataverse run build:api-json')

console.log('Building @unseenco/backstage/gsap (types + api model)…')
run('yarn workspace @unseenco/backstage-gsap run build:ts')
run('yarn workspace @unseenco/backstage-gsap run build:api-json')

const apiJsonDir = path.join(root, '.temp', 'api')
const outputDir = path.join(docsDir, 'api')

console.log(`Running api-documenter → ${outputDir}`)
run(
  `yarn api-documenter markdown --input-folder "${apiJsonDir}" --output-folder "${outputDir}"`,
)

console.log('Post-processing api-documenter Markdown (table + fence fixes)…')
fixApiDocumenterMarkdownFiles(outputDir)

console.log('API reference Markdown generated.')
