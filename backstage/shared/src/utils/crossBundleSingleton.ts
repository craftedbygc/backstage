/**
 * Holds mutable singleton state on `globalThis` so separate published bundles
 * (core, gsap, studio) that each inline `backstage/shared` still share one instance.
 */
export function crossBundleSingleton<T>(key: string, create: () => T): T {
  const storeKey = `__unseenco_backstage_${key}_v1__`
  const g = globalThis as typeof globalThis & Record<string, T | undefined>
  if (g[storeKey] === undefined) {
    g[storeKey] = create()
  }
  return g[storeKey]!
}
