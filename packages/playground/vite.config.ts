import {defineConfig} from 'vite'

import react from '@vitejs/plugin-react-swc'

import path from 'path'

import fg from 'fast-glob'

import {getAliasesFromTsConfigForRollup} from '../../devEnv/getAliasesFromTsConfig'

import {definedGlobals} from '../../backstage/devEnv/definedGlobals'

import {backstageLiteThreePeersPlugin} from './devEnv/backstageLiteThreeVitePlugin'

import {
  getPlaygroundDistAliasesForRollup,
  playgroundUsesDistPackages,
} from './devEnv/playgroundResolveAliases'

const fromPlaygroundDir = (folder: string) => path.resolve(__dirname, folder)

const srcDir = fromPlaygroundDir('src')

const sharedDir = fromPlaygroundDir('src/shared')

const personalDir = fromPlaygroundDir('src/personal')

const testDir = fromPlaygroundDir('src/tests')

function globDemoHtmlEntries(dir: string): Promise<string[]> {
  return fg('*/index.html', {cwd: dir, absolute: true})
}

function demoModuleNames(htmlPaths: string[]): string[] {
  return htmlPaths.map((entry) => path.basename(path.dirname(entry)))
}

// https://vitejs.dev/config/

const config = defineConfig(async ({command, mode}) => {
  const isPreview = process.argv.includes('preview')

  const dev = command === 'serve' && !isPreview

  const useDistPackages =
    playgroundUsesDistPackages() || mode === 'playground-dist'

  const groups = {
    shared: await globDemoHtmlEntries(sharedDir),

    personal: await globDemoHtmlEntries(personalDir),

    test: await globDemoHtmlEntries(testDir),
  }

  const playgroundDemoGroups = {
    shared: demoModuleNames(groups.shared),

    personal: demoModuleNames(groups.personal),
  }

  const rollupInputs = (() => {
    // eg ['path/to/src/group/playground/index.html']

    const paths = ([] as string[]).concat(...Object.values(groups))

    // eg ['group/playground']

    const names = paths.map((entry) => {
      // convert "/path/to/src/group/playground/index.html" to "group/playground"

      const relativePath = path.relative(srcDir, entry)

      const entryName = relativePath
        .replace(/\\/g, '/')
        .replace(/\/index\.html$/, '')

      return entryName
    })

    // eg { 'group/playground': 'path/to/src/group/playground/index.html' }

    return Object.fromEntries(names.map((name, index) => [name, paths[index]]))
  })()

  /** Dev server uses `/`; production builds use `/playground/` for unified Netlify deploy. */

  const base = dev ? '/' : '/playground/'

  const resolveAliases = useDistPackages
    ? getPlaygroundDistAliasesForRollup()
    : getAliasesFromTsConfigForRollup()

  if (useDistPackages && !dev) {
    console.log(
      'PLAYGROUND_USE_DIST: bundling @unseenco/backstage from package dist/ (run yarn cli build first)',
    )
  }

  return {
    base,

    root: srcDir,

    plugins: [backstageLiteThreePeersPlugin(), react()],

    appType: 'mpa',

    server: {
      port: 8082,
    },

    assetsInclude: ['**/*.gltf', '**/*.glb'],

    resolve: {
      /*

    By default, aliases point at monorepo source (fast iteration).

    Set PLAYGROUND_USE_DIST=1 to bundle the production dist/ output instead.

    */

      alias: [...resolveAliases],
    },

    define: {
      ...definedGlobals,

      'window.__IS_VISUAL_REGRESSION_TESTING': 'false',

      __PLAYGROUND_DEMO_GROUPS__: JSON.stringify(playgroundDemoGroups),

      ...(useDistPackages
        ? {'process.env.BUILT_FOR_PLAYGROUND': JSON.stringify('true')}
        : {}),
    },

    optimizeDeps: {
      exclude: dev
        ? [
            '@unseenco/backstage',

            '@unseenco/backstage/core-lite',

            '@unseenco/backstage/studio',

            '@unseenco/backstage/studio-lite',
          ]
        : [],
    },

    build: {
      outDir: '../build',

      emptyOutDir: true,

      minify: false,

      sourcemap: true,

      rollupOptions: {
        input: {
          ...rollupInputs,

          main: fromPlaygroundDir('src/index.html'),
        },
      },
    },
  }
})

export default config
