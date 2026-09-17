/**
 * Builds api-extractor doc models for Theatre public packages and runs
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

console.log('Building TypeScript declarations for @unseenco/theatre-core and studio…')
run('yarn workspace theatre run build:ts')

console.log('Generating api-extractor doc models (core, studio)…')
run('yarn workspace theatre run build:api-json')

console.log('Building @unseenco/theatre-threejs (types + api model)…')
run('yarn workspace @unseenco/theatre-threejs run build:ts')
run('yarn workspace @unseenco/theatre-threejs run build:api-json')

console.log('Building @unseenco/theatre-dataverse (types + api model)…')
run('yarn workspace @unseenco/theatre-dataverse run build:ts')
run('yarn workspace @unseenco/theatre-dataverse run build:api-json')

console.log('Building @unseenco/theatre-gsap (types + api model)…')
run('yarn workspace @unseenco/theatre-gsap run build:ts')
run('yarn workspace @unseenco/theatre-gsap run build:api-json')

const apiJsonDir = path.join(root, '.temp', 'api')
const outputDir = path.join(docsDir, 'api')

console.log(`Running api-documenter → ${outputDir}`)
run(
  `yarn api-documenter markdown --input-folder "${apiJsonDir}" --output-folder "${outputDir}"`,
)

console.log('Post-processing api-documenter Markdown (table + fence fixes)…')
fixApiDocumenterMarkdownFiles(outputDir)

console.log('API reference Markdown generated.')
