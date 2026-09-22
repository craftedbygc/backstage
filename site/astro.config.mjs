import {defineConfig} from 'astro/config'
import tailwind from '@astrojs/tailwind'
import {createRequire} from 'node:module'

const require = createRequire(import.meta.url)
const {backstageConsumerViteConfig} = require('../devEnv/backstageConsumerVite.js')

const backstageVite = backstageConsumerViteConfig()

/** @type {import('astro').AstroUserConfig} */
export default defineConfig({
  site: 'https://backstage.unseen.co',
  base: '/',
  integrations: [tailwind()],
  vite: {
    resolve: backstageVite.resolve,
    define: backstageVite.define,
    optimizeDeps: backstageVite.optimizeDeps,
  },
})
