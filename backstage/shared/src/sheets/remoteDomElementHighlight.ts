import type {RemoteDomHighlightTarget} from '@unseenco/backstage-shared/gsap/domElementHighlightTarget'
import {crossBundleSingleton} from '@unseenco/backstage-shared/utils/crossBundleSingleton'

type RemoteDomElementHighlightStore = {
  channelCache: Map<string, BroadcastChannel>
  listeners: Set<(element: Element | null) => void>
}

function getStore(): RemoteDomElementHighlightStore {
  return crossBundleSingleton('remote_dom_element_highlight', () => ({
    channelCache: new Map<string, BroadcastChannel>(),
    listeners: new Set<(element: Element | null) => void>(),
  }))
}

function getRemoteBroadcastChannel(
  projectId: string,
): BroadcastChannel | undefined {
  if (typeof BroadcastChannel === 'undefined') {
    return undefined
  }
  const store = getStore()
  let channel = store.channelCache.get(projectId)
  if (!channel) {
    channel = new BroadcastChannel(`backstage-remote:${projectId}`)
    store.channelCache.set(projectId, channel)
  }
  return channel
}

export type RemoteDomHighlightBroadcastEvent =
  | {
      event: 'highlightDomTarget'
      data: {target: RemoteDomHighlightTarget}
    }
  | {event: 'clearDomHighlight'; data: Record<string, never>}

export function postRemoteDomHighlightBroadcast(
  projectId: string,
  target: RemoteDomHighlightTarget,
): void {
  const channel = getRemoteBroadcastChannel(projectId)
  const message: RemoteDomHighlightBroadcastEvent = {
    event: 'highlightDomTarget',
    data: {target},
  }
  channel?.postMessage(message)
}

export function postRemoteDomHighlightClear(projectId: string): void {
  const channel = getRemoteBroadcastChannel(projectId)
  const message: RemoteDomHighlightBroadcastEvent = {
    event: 'clearDomHighlight',
    data: {},
  }
  channel?.postMessage(message)
}

/** Main preview window: apply highlight from remote editor hover. */
export function setRemoteDomElementHighlight(element: Element | null): void {
  for (const listener of getStore().listeners) {
    listener(element)
  }
}

export function onRemoteDomElementHighlightChange(
  listener: (element: Element | null) => void,
): () => void {
  const store = getStore()
  store.listeners.add(listener)
  return () => {
    store.listeners.delete(listener)
  }
}
