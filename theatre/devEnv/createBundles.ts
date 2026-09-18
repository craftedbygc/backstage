import path from 'path'
import fs from 'fs'
import * as esbuild from 'esbuild'
import {definedGlobals} from './definedGlobals'

function writeCorePrivateAPIsShim(pathToPackage: string) {
  const dist = path.join(pathToPackage, 'dist')
  fs.writeFileSync(
    path.join(dist, 'privateAPIs.mjs'),
    `export { privateAPI, setPrivateAPI } from './index.mjs';\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'privateAPIs.js'),
    `'use strict';\nconst index = require('./index.js');\nexports.privateAPI = index.privateAPI;\nexports.setPrivateAPI = index.setPrivateAPI;\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'privateAPIs.d.ts'),
    `export { privateAPI, setPrivateAPI } from './index';\n`,
  )
}

/** Re-export shims so deep imports (e.g. from published `@unseenco/theatre-threejs`) resolve to the main bundle singleton. */
function writeStudioSubpathShims(pathToPackage: string) {
  const dist = path.join(pathToPackage, 'dist')
  fs.mkdirSync(path.join(dist, 'propEditors'), {recursive: true})

  fs.writeFileSync(
    path.join(dist, 'getStudio.mjs'),
    `export { getStudio as default, setStudio } from './index.mjs';\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'getStudio.js'),
    `'use strict';\nconst index = require('./index.js');\nexports.default = index.getStudio;\nexports.setStudio = index.setStudio;\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'getStudio.d.ts'),
    `export { getStudio as default, setStudio } from './index';\n`,
  )

  fs.writeFileSync(
    path.join(dist, 'propEditors/projectHasDivergedFromSavedState.mjs'),
    `export {
  projectHasDivergedFromSavedState,
  studioHasDivergedFromSavedState,
} from '../index.mjs';\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'propEditors/projectHasDivergedFromSavedState.js'),
    `'use strict';\nconst index = require('../index.js');\nexports.projectHasDivergedFromSavedState = index.projectHasDivergedFromSavedState;\nexports.studioHasDivergedFromSavedState = index.studioHasDivergedFromSavedState;\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'propEditors/projectHasDivergedFromSavedState.d.ts'),
    `export {
  projectHasDivergedFromSavedState,
  studioHasDivergedFromSavedState,
} from '../index';\n`,
  )

  fs.writeFileSync(
    path.join(dist, 'propEditors/objectHasDivergedFromSavedState.mjs'),
    `export {
  objectHasDivergedFromSavedState,
  sheetObjectDivergesFromSavedState,
} from '../index.mjs';\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'propEditors/objectHasDivergedFromSavedState.js'),
    `'use strict';\nconst index = require('../index.js');\nexports.objectHasDivergedFromSavedState = index.objectHasDivergedFromSavedState;\nexports.sheetObjectDivergesFromSavedState = index.sheetObjectDivergesFromSavedState;\n`,
  )
  fs.writeFileSync(
    path.join(dist, 'propEditors/objectHasDivergedFromSavedState.d.ts'),
    `export {
  objectHasDivergedFromSavedState,
  sheetObjectDivergesFromSavedState,
} from '../index';\n`,
  )
}

export async function createBundles(watch: boolean) {
  for (const which of ['core', 'studio']) {
    const pathToPackage = path.join(__dirname, '../', which)
    const esbuildConfig: Parameters<typeof esbuild.context>[0] = {
      entryPoints: [path.join(pathToPackage, 'src/index.ts')],
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

    if (which === 'core') {
      esbuildConfig.platform = 'neutral'
      esbuildConfig.mainFields = ['browser', 'module', 'main']
      esbuildConfig.conditions = ['browser', 'node']
    } else {
      esbuildConfig.define!['process.env.NODE_ENV'] =
        JSON.stringify('production')

      esbuildConfig.minify = true
    }

    const outputs: Array<{outfile: string; format: 'cjs' | 'esm'}> = [
      {outfile: path.join(pathToPackage, 'dist/index.js'), format: 'cjs'},
      {outfile: path.join(pathToPackage, 'dist/index.mjs'), format: 'esm'},
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

    if (!watch) {
      if (which === 'core') {
        writeCorePrivateAPIsShim(pathToPackage)
      }
      if (which === 'studio') {
        writeStudioSubpathShims(pathToPackage)
      }
    }
  }
}
