import path from 'path'
import fs from 'fs'
import * as esbuild from 'esbuild'
import {definedGlobals} from './definedGlobals'

function writeCoreLenisShim(pathToPackage: string) {
  const dist = path.join(pathToPackage, 'dist')
  fs.writeFileSync(
    path.join(dist, 'lenis.mjs'),
    `export { createLenisScrollDriver } from './lenis-entry.mjs';\nexport type { LenisScrollDriverSource } from './lenis-entry.mjs';\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'lenis.js'),
    `'use strict';\nconst lenisEntry = require('./lenis-entry.js');\nexports.createLenisScrollDriver = lenisEntry.createLenisScrollDriver;\n`,
  )
  const lenisDts = path.join(
    __dirname,
    '../.temp/declarations/core/src/lenis.d.ts',
  )
  if (fs.existsSync(lenisDts)) {
    fs.copyFileSync(lenisDts, path.join(dist, 'lenis-entry.d.ts'))
  }
  fs.writeFileSync(
    path.join(dist, 'lenis.d.ts'),
    `export { createLenisScrollDriver } from './lenis-entry';\nexport type { LenisScrollDriverSource } from './lenis-entry';\n`,
  )
}

function writeCorePrivateAPIsShim(pathToPackage: string) {
  const dist = path.join(pathToPackage, 'dist')
  fs.writeFileSync(
    path.join(dist, 'privateAPIs.mjs'),
    `export { privateAPI, setPrivateAPI, getTheatreCoreRafDriver } from './index.mjs';\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'privateAPIs.js'),
    `'use strict';\nconst index = require('./index.js');\nexports.privateAPI = index.privateAPI;\nexports.setPrivateAPI = index.setPrivateAPI;\nexports.getTheatreCoreRafDriver = index.getTheatreCoreRafDriver;\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'privateAPIs.d.ts'),
    `export { privateAPI, setPrivateAPI, getTheatreCoreRafDriver } from './index';\n`,
  )
}

/** Re-export shims so deep imports (e.g. from published `@unseenco/theatre-threejs`) resolve to the main bundle singleton. */
function writeStudioSubpathShims(
  dist: string,
  indexBasename: 'index' | 'index-lite',
) {
  fs.mkdirSync(path.join(dist, 'propEditors'), {recursive: true})

  const indexModule = `./${indexBasename}`

  fs.writeFileSync(
    path.join(dist, 'getStudio.mjs'),
    `export { getStudio as default, setStudio } from '${indexModule}.mjs';\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'getStudio.js'),
    `'use strict';\nconst index = require('${indexModule}.js');\nexports.default = index.getStudio;\nexports.setStudio = index.setStudio;\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'getStudio.d.ts'),
    `export { getStudio as default, setStudio } from '${indexModule}';\n`,
  )

  fs.writeFileSync(
    path.join(dist, 'propEditors/projectHasDivergedFromSavedState.mjs'),
    `export {
  projectHasDivergedFromSavedState,
  studioHasDivergedFromSavedState,
} from '../${indexBasename}.mjs';\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'propEditors/projectHasDivergedFromSavedState.js'),
    `'use strict';\nconst index = require('../${indexBasename}.js');\nexports.projectHasDivergedFromSavedState = index.projectHasDivergedFromSavedState;\nexports.studioHasDivergedFromSavedState = index.studioHasDivergedFromSavedState;\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'propEditors/projectHasDivergedFromSavedState.d.ts'),
    `export {
  projectHasDivergedFromSavedState,
  studioHasDivergedFromSavedState,
} from '../${indexBasename}';\n`,
  )

  fs.writeFileSync(
    path.join(dist, 'propEditors/objectHasDivergedFromSavedState.mjs'),
    `export {
  objectHasDivergedFromSavedState,
  sheetObjectDivergesFromSavedState,
} from '../${indexBasename}.mjs';\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'propEditors/objectHasDivergedFromSavedState.js'),
    `'use strict';\nconst index = require('../${indexBasename}.js');\nexports.objectHasDivergedFromSavedState = index.objectHasDivergedFromSavedState;\nexports.sheetObjectDivergesFromSavedState = index.sheetObjectDivergesFromSavedState;\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'propEditors/objectHasDivergedFromSavedState.d.ts'),
    `export {
  objectHasDivergedFromSavedState,
  sheetObjectDivergesFromSavedState,
} from '../${indexBasename}';\n`,
  )
}

function copyCoreLitePackageArtifacts(coreDist: string, coreLiteDist: string) {
  fs.mkdirSync(coreLiteDist, {recursive: true})
  const liteArtifacts = [
    'index-lite.js',
    'index-lite.mjs',
    'index-lite.js.map',
    'index-lite.mjs.map',
  ]
  for (const file of liteArtifacts) {
    const from = path.join(coreDist, file)
    if (fs.existsSync(from)) {
      const toName = file.replace('index-lite', 'index')
      fs.copyFileSync(from, path.join(coreLiteDist, toName))
    }
  }
  const indexDts = path.join(coreDist, 'index-lite.d.ts')
  if (fs.existsSync(indexDts)) {
    fs.copyFileSync(indexDts, path.join(coreLiteDist, 'index.d.ts'))
  } else if (fs.existsSync(path.join(coreDist, 'index.d.ts'))) {
    fs.copyFileSync(
      path.join(coreDist, 'index.d.ts'),
      path.join(coreLiteDist, 'index.d.ts'),
    )
  }

  const privateApis = ['privateAPIs.js', 'privateAPIs.mjs', 'privateAPIs.d.ts']
  for (const file of privateApis) {
    const from = path.join(coreDist, file)
    if (fs.existsSync(from)) {
      fs.copyFileSync(from, path.join(coreLiteDist, file))
    }
  }
}

function copyStudioLitePackageArtifacts(
  studioDist: string,
  studioLiteDist: string,
) {
  fs.mkdirSync(studioLiteDist, {recursive: true})
  const liteArtifacts = [
    'index-lite.js',
    'index-lite.mjs',
    'index-lite.js.map',
    'index-lite.mjs.map',
  ]
  for (const file of liteArtifacts) {
    const from = path.join(studioDist, file)
    if (fs.existsSync(from)) {
      const toName = file.replace('index-lite', 'index')
      fs.copyFileSync(from, path.join(studioLiteDist, toName))
    }
  }
  const indexDts = path.join(studioDist, 'index-lite.d.ts')
  if (fs.existsSync(indexDts)) {
    fs.copyFileSync(indexDts, path.join(studioLiteDist, 'index.d.ts'))
  } else if (fs.existsSync(path.join(studioDist, 'index.d.ts'))) {
    fs.copyFileSync(
      path.join(studioDist, 'index.d.ts'),
      path.join(studioLiteDist, 'index.d.ts'),
    )
  }

  for (const sub of ['getStudio', 'propEditors']) {
    const subSrc = path.join(studioDist, sub)
    const subDst = path.join(studioLiteDist, sub)
    if (!fs.existsSync(subSrc)) continue
    fs.mkdirSync(subDst, {recursive: true})
    for (const entry of fs.readdirSync(subSrc)) {
      fs.copyFileSync(path.join(subSrc, entry), path.join(subDst, entry))
    }
  }
}

/**
 * Compare minified bundle sizes (run after `yarn workspace theatre build:js`).
 * Set `THEATRE_LITE_LOG_BUNDLE_SIZES=1` to print sizes when building.
 *
 * `core/dist/index.*` vs `core/dist/index-lite.*` (published as `@unseenco/theatre-core-lite`).
 * `studio/dist/index.*` vs `studio/dist/index-lite.*`
 * (lite omits sequence editor via `__THEATRE_LITE__` dead-code elimination as
 * gates expand).
 */
function logTheatreLiteBundleSizesIfRequested() {
  if (process.env.THEATRE_LITE_LOG_BUNDLE_SIZES !== '1') return

  const pairs = [
    ['core', 'index'],
    ['core', 'index-lite'],
    ['core-lite', 'index'],
    ['studio', 'index'],
    ['studio', 'index-lite'],
  ] as const

  for (const [pkg, base] of pairs) {
    const dist = path.join(__dirname, '../', pkg, 'dist')
    for (const ext of ['js', 'mjs'] as const) {
      const file = path.join(dist, `${base}.${ext}`)
      if (fs.existsSync(file)) {
        const kb = (fs.statSync(file).size / 1024).toFixed(1)
        console.log(`[theatre-lite sizes] ${pkg}/${base}.${ext}: ${kb} KiB`)
      }
    }
  }
}

type BundleTarget = {
  which: 'core' | 'studio'
  entry: string
  outBasename: string
  theatreLite: boolean
}

export async function createBundles(watch: boolean) {
  const targets: BundleTarget[] = [
    {
      which: 'core',
      entry: 'index.ts',
      outBasename: 'index',
      theatreLite: false,
    },
    {
      which: 'core',
      entry: 'index-lite.ts',
      outBasename: 'index-lite',
      theatreLite: true,
    },
    {
      which: 'studio',
      entry: 'index.ts',
      outBasename: 'index',
      theatreLite: false,
    },
    {
      which: 'studio',
      entry: 'index-lite.ts',
      outBasename: 'index-lite',
      theatreLite: true,
    },
  ]

  for (const target of targets) {
    const pathToPackage = path.join(__dirname, '../', target.which)
    const esbuildConfig: Parameters<typeof esbuild.context>[0] = {
      entryPoints: [path.join(pathToPackage, 'src', target.entry)],
      target: 'es2020',
      loader: {'.png': 'file', '.svg': 'dataurl'},
      bundle: true,
      sourcemap: true,
      supported: {
        // 'unicode-escapes': false,
        'template-literal': false,
      },
      define: {
        ...definedGlobals,
        __THEATRE_LITE__: target.theatreLite ? 'true' : 'false',
        __IS_VISUAL_REGRESSION_TESTING: 'false',
      },
      external: [
        '@unseenco/theatre-dataverse',
        /**
         * Prevents double-bundling react.
         *
         * @remarks
         * Ideally we'd want to just bundle our own fixed version of react to keep things
         * simple, but for now we keep react external because we're exposing these
         * react-dependant API from \@unseenco/theatre-studio:
         *
         * - `ToolbarIconButton`
         * - `IStudio['extend']({globalToolbar: {component}})`
         *
         * It's probably possible to bundle our own react version and somehow share it
         * with the plugins, but that's not urgent atm.
         */
        // 'react',
        // 'react-dom',
        // 'styled-components',
      ],
    }

    if (target.which === 'core') {
      esbuildConfig.platform = 'neutral'
      esbuildConfig.mainFields = ['browser', 'module', 'main']
      esbuildConfig.conditions = ['browser', 'node']
    } else {
      esbuildConfig.define!['process.env.NODE_ENV'] =
        JSON.stringify('production')

      esbuildConfig.minify = true
    }

    const outputs: Array<{outfile: string; format: 'cjs' | 'esm'}> = [
      {
        outfile: path.join(pathToPackage, `dist/${target.outBasename}.js`),
        format: 'cjs',
      },
      {
        outfile: path.join(pathToPackage, `dist/${target.outBasename}.mjs`),
        format: 'esm',
      },
    ]

    for (const {outfile, format} of outputs) {
      const ctx = await esbuild.context({
        ...esbuildConfig,
        outfile,
        format,
      })

      if (watch) {
        await ctx.watch()
      } else {
        await ctx.rebuild()
        await ctx.dispose()
      }
    }
  }

  if (!watch) {
    const corePackage = path.join(__dirname, '../core')
    const coreDist = path.join(corePackage, 'dist')
    writeCorePrivateAPIsShim(corePackage)
    writeCoreLenisShim(corePackage)

    const coreIndexDts = path.join(coreDist, 'index.d.ts')
    const coreIndexLiteDts = path.join(coreDist, 'index-lite.d.ts')
    if (fs.existsSync(coreIndexDts) && !fs.existsSync(coreIndexLiteDts)) {
      fs.copyFileSync(coreIndexDts, coreIndexLiteDts)
    }

    const coreLiteDist = path.join(__dirname, '../core-lite/dist')
    copyCoreLitePackageArtifacts(coreDist, coreLiteDist)
    writeCorePrivateAPIsShim(path.join(__dirname, '../core-lite'))

    const studioPackage = path.join(__dirname, '../studio')
    const studioDist = path.join(studioPackage, 'dist')
    writeStudioSubpathShims(studioDist, 'index')

    const studioLiteDist = path.join(__dirname, '../studio-lite/dist')
    copyStudioLitePackageArtifacts(studioDist, studioLiteDist)
    writeStudioSubpathShims(studioLiteDist, 'index')

    const indexDts = path.join(studioDist, 'index.d.ts')
    const indexLiteDts = path.join(studioDist, 'index-lite.d.ts')
    if (fs.existsSync(indexDts) && !fs.existsSync(indexLiteDts)) {
      fs.copyFileSync(indexDts, indexLiteDts)
    }

    const lenisOutputs: Array<{outfile: string; format: 'cjs' | 'esm'}> = [
      {
        outfile: path.join(corePackage, 'dist/lenis-entry.js'),
        format: 'cjs',
      },
      {
        outfile: path.join(corePackage, 'dist/lenis-entry.mjs'),
        format: 'esm',
      },
    ]
    const lenisConfig: Parameters<typeof esbuild.context>[0] = {
      entryPoints: [path.join(corePackage, 'src/lenis.ts')],
      target: 'es2020',
      loader: {'.png': 'file', '.svg': 'dataurl'},
      bundle: true,
      sourcemap: true,
      supported: {
        'template-literal': false,
      },
      define: {
        ...definedGlobals,
        __THEATRE_LITE__: 'false',
        __IS_VISUAL_REGRESSION_TESTING: 'false',
      },
      external: ['@unseenco/theatre-dataverse'],
      platform: 'neutral',
      mainFields: ['browser', 'module', 'main'],
      conditions: ['browser', 'node'],
    }
    for (const {outfile, format} of lenisOutputs) {
      const ctx = await esbuild.context({
        ...lenisConfig,
        outfile,
        format,
      })
      await ctx.rebuild()
      await ctx.dispose()
    }

    logTheatreLiteBundleSizesIfRequested()
  }
}
