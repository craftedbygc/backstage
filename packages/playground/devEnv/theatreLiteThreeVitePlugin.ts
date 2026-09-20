import fs from 'fs'
import path from 'path'
import type {Plugin} from 'vite'

/** Suffix for imports that must resolve Theatre peers to core-lite / studio-lite. */
export const THEATRE_LITE_PEERS_QUERY = '?theatre-lite-peers'

const PEER_REWRITES: Array<[string, string]> = [
  ['@unseenco/theatre-core', '@unseenco/theatre-core-lite'],
  ['@unseenco/theatre-studio', '@unseenco/theatre-studio-lite'],
]

/** Vite always uses `/` in module ids, even on Windows. */
export function normalizeModulePath(filePath: string): string {
  return filePath.split('?')[0].replace(/\\/g, '/')
}

export function isLitePlaygroundImporter(importer: string | undefined): boolean {
  if (!importer) return false
  const normalized = normalizeModulePath(importer)
  return (
    normalized.includes('/shared/theatre-lite-three/') ||
    normalized.includes('/shared/theatre-lite/')
  )
}

export function isInLitePeersGraph(
  importer: string | undefined,
  source?: string,
): boolean {
  if (!importer) return false
  if (importer.includes(THEATRE_LITE_PEERS_QUERY)) return true
  if (isLitePlaygroundImporter(importer)) return true
  if (source?.endsWith(THEATRE_LITE_PEERS_QUERY)) return true
  return false
}

function stripLitePeersQuery(id: string): string {
  return id.endsWith(THEATRE_LITE_PEERS_QUERY)
    ? id.slice(0, -THEATRE_LITE_PEERS_QUERY.length)
    : id
}

function withLitePeersQuery(id: string): string {
  return id.endsWith(THEATRE_LITE_PEERS_QUERY)
    ? id
    : id + THEATRE_LITE_PEERS_QUERY
}

function isTheatreThreejsImport(source: string): boolean {
  return (
    source === '@unseenco/theatre-threejs' ||
    source.startsWith('@unseenco/theatre-threejs/')
  )
}

/**
 * Playground-only: `@unseenco/theatre-threejs` normally imports full core/studio.
 * Lite demos append `?theatre-lite-peers` so the dependency graph uses lite packages.
 */
export function rewriteTheatrePeersInSource(code: string): string {
  let out = code
  for (const [from, to] of PEER_REWRITES) {
    out = out.replaceAll(from, to)
  }
  return out
}

function shouldRewriteLoadedSource(realId: string): boolean {
  const normalized = normalizeModulePath(realId)
  return (
    normalized.includes('/packages/threejs/') ||
    normalized.includes('/theatre/studio/') ||
    normalized.includes('/theatre/core/')
  )
}

export function theatreLiteThreePeersPlugin(): Plugin {
  return {
    name: 'theatre-lite-three-peers',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (source.endsWith(THEATRE_LITE_PEERS_QUERY)) {
        const bare = source.slice(0, -THEATRE_LITE_PEERS_QUERY.length)
        const resolved = await this.resolve(bare, importer, {
          ...options,
          skipSelf: true,
        })
        if (resolved) {
          return withLitePeersQuery(resolved.id)
        }
        return null
      }

      if (
        isLitePlaygroundImporter(importer) &&
        isTheatreThreejsImport(source) &&
        !source.endsWith(THEATRE_LITE_PEERS_QUERY)
      ) {
        const resolved = await this.resolve(
          source + THEATRE_LITE_PEERS_QUERY,
          importer,
          {...options, skipSelf: true},
        )
        if (resolved) {
          return resolved
        }
      }

      if (!isInLitePeersGraph(importer, source)) {
        return null
      }

      for (const [from, to] of PEER_REWRITES) {
        if (source === from || source.startsWith(`${from}/`)) {
          const rewritten = source.replace(from, to)
          const resolved = await this.resolve(rewritten, importer, {
            ...options,
            skipSelf: true,
          })
          if (resolved) {
            return withLitePeersQuery(resolved.id)
          }
        }
      }

      if (source.startsWith('.')) {
        const resolved = await this.resolve(source, importer, {
          ...options,
          skipSelf: true,
        })
        if (resolved) {
          const normalized = normalizeModulePath(resolved.id)
          if (
            normalized.includes('/packages/threejs/') ||
            normalized.includes('/theatre/studio/') ||
            normalized.includes('/theatre/core/')
          ) {
            return withLitePeersQuery(resolved.id)
          }
        }
      }

      return null
    },
    load(id) {
      if (!id.endsWith(THEATRE_LITE_PEERS_QUERY)) {
        return null
      }
      const realId = stripLitePeersQuery(id)
      const source = fs.readFileSync(realId, 'utf-8')
      if (shouldRewriteLoadedSource(realId)) {
        return rewriteTheatrePeersInSource(source)
      }
      return source
    },
    transform(code, id) {
      if (!id.endsWith(THEATRE_LITE_PEERS_QUERY)) {
        return null
      }
      const realId = stripLitePeersQuery(id)
      if (!shouldRewriteLoadedSource(realId)) {
        return null
      }
      const rewritten = rewriteTheatrePeersInSource(code)
      return rewritten === code ? null : rewritten
    },
  }
}
