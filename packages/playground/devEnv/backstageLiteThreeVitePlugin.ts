import fs from 'fs'
import type {Plugin} from 'vite'

/** Suffix for imports that must resolve Backstage peers to core-lite / studio-lite. */
export const BACKSTAGE_LITE_PEERS_QUERY = '?backstage-lite-peers'

const PEER_REWRITES: Array<[string, string]> = [
  ['@unseenco/backstage', '@unseenco/backstage/core-lite'],
  ['@unseenco/backstage/studio', '@unseenco/backstage/studio-lite'],
]

/** Separate workspace packages under the `@unseenco/backstage/*` namespace (not core sources). */
const BACKSTAGE_NON_CORE_SUBPATHS = new Set([
  'threejs',
  'gsap',
  'react',
  'dataverse',
  'studio',
  'studio-lite',
  'core-lite',
])

export function shouldRewriteBackstageImportToCoreLite(
  specifier: string,
): boolean {
  if (specifier === '@unseenco/backstage') return true
  if (!specifier.startsWith('@unseenco/backstage/')) return false
  const subpath = specifier.slice('@unseenco/backstage/'.length).split('/')[0]
  return !BACKSTAGE_NON_CORE_SUBPATHS.has(subpath)
}

/** Vite always uses `/` in module ids, even on Windows. */
export function normalizeModulePath(filePath: string): string {
  return filePath.split('?')[0].replace(/\\/g, '/')
}

export function isLitePlaygroundImporter(
  importer: string | undefined,
): boolean {
  if (!importer) return false
  const normalized = normalizeModulePath(importer)
  return (
    normalized.includes('/shared/backstage-lite-three/') ||
    normalized.includes('/shared/backstage-lite/')
  )
}

export function isInLitePeersGraph(
  importer: string | undefined,
  source?: string,
): boolean {
  if (!importer) return false
  if (importer.includes(BACKSTAGE_LITE_PEERS_QUERY)) return true
  if (isLitePlaygroundImporter(importer)) return true
  if (source?.endsWith(BACKSTAGE_LITE_PEERS_QUERY)) return true
  return false
}

function stripLitePeersQuery(id: string): string {
  return id.endsWith(BACKSTAGE_LITE_PEERS_QUERY)
    ? id.slice(0, -BACKSTAGE_LITE_PEERS_QUERY.length)
    : id
}

function withLitePeersQuery(id: string): string {
  return id.endsWith(BACKSTAGE_LITE_PEERS_QUERY)
    ? id
    : id + BACKSTAGE_LITE_PEERS_QUERY
}

function isBackstageThreejsImport(source: string): boolean {
  return (
    source === '@unseenco/backstage/threejs' ||
    source.startsWith('@unseenco/backstage/threejs/')
  )
}

/**
 * Playground-only: `@unseenco/backstage/threejs` normally imports full core/studio.
 * Lite demos append `?backstage-lite-peers` so the dependency graph uses lite packages.
 */
/** Rewrite full core/studio imports to lite peers without double `-lite` suffixes. */
export function rewriteBackstagePeersInSource(code: string): string {
  return code
    .replace(
      /@unseenco\/backstage\/studio(?!-lite)(?=\/|['"])/g,
      '@unseenco/backstage/studio-lite',
    )
    .replace(
      /@unseenco\/backstage(?!\/core-lite|\/studio-lite|\/threejs|\/gsap|\/react|\/dataverse|\/studio)(?=\/|['"])/g,
      '@unseenco/backstage/core-lite',
    )
    .replace(
      /@unseenco\/backstage-core(?!-lite)(?=\/|['"])/g,
      '@unseenco/backstage/core-lite',
    )
    .replace(
      /@unseenco\/backstage-studio(?!-lite)(?=\/|['"])/g,
      '@unseenco/backstage/studio-lite',
    )
}

function shouldRewriteLoadedSource(realId: string): boolean {
  const normalized = normalizeModulePath(realId)
  return (
    normalized.includes('/packages/threejs/') ||
    normalized.includes('/backstage/studio/') ||
    normalized.includes('/backstage/core/')
  )
}

export function backstageLiteThreePeersPlugin(): Plugin {
  return {
    name: 'backstage-lite-three-peers',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (source.endsWith(BACKSTAGE_LITE_PEERS_QUERY)) {
        const bare = source.slice(0, -BACKSTAGE_LITE_PEERS_QUERY.length)
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
        isBackstageThreejsImport(source) &&
        !source.endsWith(BACKSTAGE_LITE_PEERS_QUERY)
      ) {
        const resolved = await this.resolve(
          source + BACKSTAGE_LITE_PEERS_QUERY,
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
        if (from === '@unseenco/backstage') {
          if (!shouldRewriteBackstageImportToCoreLite(source)) {
            continue
          }
        }
        if (
          source === from ||
          (source.startsWith(`${from}/`) && !source.startsWith(`${to}/`))
        ) {
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
            normalized.includes('/backstage/studio/') ||
            normalized.includes('/backstage/core/')
          ) {
            return withLitePeersQuery(resolved.id)
          }
        }
      }

      return null
    },
    load(id) {
      if (!id.endsWith(BACKSTAGE_LITE_PEERS_QUERY)) {
        return null
      }
      const realId = stripLitePeersQuery(id)
      const source = fs.readFileSync(realId, 'utf-8')
      if (shouldRewriteLoadedSource(realId)) {
        return rewriteBackstagePeersInSource(source)
      }
      return source
    },
    transform(code, id) {
      if (!id.endsWith(BACKSTAGE_LITE_PEERS_QUERY)) {
        return null
      }
      const realId = stripLitePeersQuery(id)
      if (!shouldRewriteLoadedSource(realId)) {
        return null
      }
      const rewritten = rewriteBackstagePeersInSource(code)
      return rewritten === code ? null : rewritten
    },
  }
}
