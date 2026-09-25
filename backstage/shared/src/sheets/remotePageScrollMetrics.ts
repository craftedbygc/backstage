import {crossBundleSingleton} from '@unseenco/backstage-shared/utils/crossBundleSingleton'
import type {PageScrollAxis} from './pageScrollContext'

export type RemotePageScrollMetrics = {
  maxScroll: number
  axis: PageScrollAxis
}

type RemotePageScrollMetricsStore = {
  remoteMetrics: RemotePageScrollMetrics | undefined
  listeners: Set<() => void>
}

function getStore(): RemotePageScrollMetricsStore {
  return crossBundleSingleton('remote_page_scroll_metrics', () => ({
    remoteMetrics: undefined,
    listeners: new Set<() => void>(),
  }))
}

export function setRemotePageScrollMetrics(
  metrics: RemotePageScrollMetrics | undefined,
): void {
  const store = getStore()
  const prev = store.remoteMetrics
  store.remoteMetrics = metrics
  if (
    prev?.maxScroll !== metrics?.maxScroll ||
    prev?.axis !== metrics?.axis
  ) {
    for (const listener of store.listeners) {
      listener()
    }
  }
}

export function getRemotePageScrollMetrics(): RemotePageScrollMetrics | undefined {
  return getStore().remoteMetrics
}

export function onRemotePageScrollMetricsChange(
  listener: () => void,
): () => void {
  const store = getStore()
  store.listeners.add(listener)
  return () => {
    store.listeners.delete(listener)
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
  const remote = getStore().remoteMetrics
  if (remote && remote.axis === axis && remote.maxScroll > 0) {
    return remote.maxScroll
  }
  return localMaxScrollPx
}
