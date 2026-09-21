import path from 'path'
import type {getAliasesFromTsConfigForRollup} from '../../../devEnv/getAliasesFromTsConfig'

const monorepoRoot = path.resolve(__dirname, '../../..')

function srcPathTemplateToDistMjs(template: string): string {
  if (template.endsWith('/index-lite.ts')) {
    return template.replace('/src/index-lite.ts', '/dist/index-lite.mjs')
  }
  if (template.endsWith('/index.ts')) {
    return template.replace('/src/index.ts', '/dist/index.mjs')
  }
  if (template.endsWith('/*')) {
    return template.replace('/src/*', '/dist/$1.mjs')
  }
  if (template.includes('/src/')) {
    return template.replace('/src/', '/dist/').replace(/\.ts$/, '.mjs')
  }
  return template
}

/** Resolve `@unseenco/backstage/*` to built `dist/*.mjs` (run `yarn cli build` first). */
export function getPlaygroundDistAliasesForRollup(): ReturnType<
  typeof getAliasesFromTsConfigForRollup
> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const tsConfigPaths = require('../../../tsconfig.base.json').compilerOptions
    .paths as Record<string, string[]>

  const aliases: ReturnType<typeof getAliasesFromTsConfigForRollup> = []

  for (let [key, value] of Object.entries(tsConfigPaths)) {
    const distTemplate = srcPathTemplateToDistMjs(value[0])

    if (key.match(/\/\*$/)) {
      key = key.replace(/\/\*$/, '/([^?]*)')
    } else {
      key = key + '(\\?.*)?$'
    }

    aliases.push({
      find: new RegExp(key),
      replacement: path.join(
        monorepoRoot,
        distTemplate.replace(/\/\*$/, '/$1'),
      ),
    })
  }

  return aliases
}

export function playgroundUsesDistPackages(): boolean {
  const v = process.env.PLAYGROUND_USE_DIST
  return v === '1' || v === 'true'
}
