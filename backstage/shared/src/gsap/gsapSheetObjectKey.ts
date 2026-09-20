const GSAP_NAMESPACE_STORE_KEY = '__unseenco_backstage_gsap_configuredNamespace__'

/** Default GSAP outline namespace segment (first path component). */
export const DEFAULT_GSAP_SHEET_OBJECT_NAMESPACE = 'GSAP'

export function setConfiguredGsapSheetObjectNamespace(namespace: string): void {
  const g = globalThis as typeof globalThis & {
    [GSAP_NAMESPACE_STORE_KEY]?: string
  }
  g[GSAP_NAMESPACE_STORE_KEY] = namespace.trim()
}

export function getConfiguredGsapSheetObjectNamespace(): string {
  const g = globalThis as typeof globalThis & {
    [GSAP_NAMESPACE_STORE_KEY]?: string
  }
  return g[GSAP_NAMESPACE_STORE_KEY] ?? DEFAULT_GSAP_SHEET_OBJECT_NAMESPACE
}

/** First segment of a Backstage slashed object key (`foo / bar` → `foo`). */
export function firstSlashedPathSegment(objectKey: string): string {
  return objectKey.split(/\s*\/\s*/g)[0]?.trim() ?? objectKey.trim()
}

/**
 * Whether a sheet object key belongs to the configured GSAP proxy namespace.
 * Keys are sanitised by Backstage as `Namespace / label`, not `Namespace/label`.
 */
export function isGsapSheetObjectKey(objectKey: string): boolean {
  const namespace = getConfiguredGsapSheetObjectNamespace()
  return firstSlashedPathSegment(objectKey) === namespace
}

/** GSAP outline proxy for a registered ScrollTrigger (`GSAP / ScrollTriggers / …`). */
export function isGsapScrollTriggerSheetObjectKey(objectKey: string): boolean {
  if (!isGsapSheetObjectKey(objectKey)) return false
  const segments = objectKey.split(/\s*\/\s*/g).map((s) => s.trim())
  return segments[1] === 'ScrollTriggers'
}
