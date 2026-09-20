import type {RemoteDomHighlightTarget} from '../gsap/domElementHighlightTarget'

const channelCache = new Map<string, BroadcastChannel>()

function getRemoteBroadcastChannel(projectId: string): BroadcastChannel | undefined {
  if (typeof BroadcastChannel === 'undefined') {
    return undefined
  }
  let channel = channelCache.get(projectId)
  if (!channel) {
    channel = new BroadcastChannel(`theatre-remote:${projectId}`)
    channelCache.set(projectId, channel)
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

const listeners = new Set<(element: Element | null) => void>()

/** Main preview window: apply highlight from remote editor hover. */
export function setRemoteDomElementHighlight(element: Element | null): void {
  for (const listener of listeners) {
    listener(element)
  }
}

export function onRemoteDomElementHighlightChange(
  listener: (element: Element | null) => void,
): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
