import type {PageScrollAxis} from './pageScrollContext'

export type RemotePageScrollMetrics = {
  maxScroll: number
  axis: PageScrollAxis
}

let remoteMetrics: RemotePageScrollMetrics | undefined

const listeners = new Set<() => void>()

export function setRemotePageScrollMetrics(
  metrics: RemotePageScrollMetrics | undefined,
): void {
  const prev = remoteMetrics
  remoteMetrics = metrics
  if (
    prev?.maxScroll !== metrics?.maxScroll ||
    prev?.axis !== metrics?.axis
  ) {
    for (const listener of listeners) {
      listener()
    }
  }
}

export function getRemotePageScrollMetrics(): RemotePageScrollMetrics | undefined {
  return remoteMetrics
}

export function onRemotePageScrollMetricsChange(
  listener: () => void,
): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * When the local document has no scroll range (e.g. remote editor with hidden
 * demo), use metrics broadcast from the main preview window.
 */
export function resolveMaxScrollPxForPageLayout(
  localMaxScrollPx: number,
  axis: PageScrollAxis,
): number {
  if (localMaxScrollPx > 0) {
    return localMaxScrollPx
  }
  const remote = remoteMetrics
  if (remote && remote.axis === axis && remote.maxScroll > 0) {
    return remote.maxScroll
  }
  return localMaxScrollPx
}
