/**
 * Runs Vite dependency pre-bundling (same path as `vite dev` startup).
 * Fails if published @unseenco/* packages have broken export maps.
 */
import {createServer} from 'vite'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const packageRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const server = await createServer({
  root: packageRoot,
  configFile: path.join(packageRoot, 'vite.config.ts'),
  logLevel: 'error',
})

try {
  await server.listen({port: 4173, strictPort: true, host: '127.0.0.1'})
} finally {
  await server.close()
}
