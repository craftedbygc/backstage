/**
 * Shared Vite options for apps that bundle @unseenco/backstage from monorepo source
 * (playground, site, etc.).
 */
const {getAliasesFromTsConfigForRollup} = require('./getAliasesFromTsConfig')

/** Mirrors {@link ../backstage/devEnv/definedGlobals.ts} */
const definedGlobals = {
  __BACKSTAGE_LITE__: 'false',
  'process.env.BACKSTAGE_VERSION': JSON.stringify(
    require('../backstage/studio/package.json').version,
  ),
  'global.Set': 'Set',
  'process.env.BUILT_FOR_PLAYGROUND': JSON.stringify('false'),
}

const BACKSTAGE_OPTIMIZE_DEPS_EXCLUDE = [
  '@unseenco/backstage',
  '@unseenco/backstage/core-lite',
  '@unseenco/backstage/studio',
  '@unseenco/backstage/studio-lite',
]

/**
 * @returns {import('vite').UserConfig['vite']}
 */
function backstageConsumerViteConfig() {
  return {
    resolve: {
      alias: [...getAliasesFromTsConfigForRollup()],
    },
    define: {
      ...definedGlobals,
      'window.__IS_VISUAL_REGRESSION_TESTING': 'false',
    },
    optimizeDeps: {
      exclude: BACKSTAGE_OPTIMIZE_DEPS_EXCLUDE,
    },
  }
}

module.exports = {
  backstageConsumerViteConfig,
  BACKSTAGE_OPTIMIZE_DEPS_EXCLUDE,
}
