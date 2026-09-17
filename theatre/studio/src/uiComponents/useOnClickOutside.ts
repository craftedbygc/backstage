import type {$IntentionalAny} from '@unseenco/theatre-shared/utils/types'
import {useEffect, useRef} from 'react'

function normalizeContainers(
  container: Element | null | (Element | null)[],
): Element[] {
  if (!container) return []
  return (
    Array.isArray(container)
      ? container.filter((c): c is Element => c != null)
      : [container]
  )
}

function eventListenTargets(containers: Element[]): EventTarget[] {
  const targets = new Set<EventTarget>([window])
  for (const el of containers) {
    const root = el.getRootNode()
    if (root instanceof ShadowRoot) {
      targets.add(root)
    }
  }
  return [...targets]
}

function isOutside(containers: Element[], event: MouseEvent): boolean {
  const path = event.composedPath()
  return containers.every((container) => !path.includes(container))
}

export default function useOnClickOutside(
  container: Element | null | (Element | null)[],
  onOutside: (e: MouseEvent) => void,
  enabled?: boolean,
  // Can be used e.g. to prevent unexpected closing-reopening when clicking on a
  // popover's trigger.
) {
  const onOutsideRef = useRef(onOutside)
  onOutsideRef.current = onOutside

  useEffect(() => {
    const containers = normalizeContainers(container)
    if (enabled === false || containers.length === 0) return

    const onPointerDown: EventListener = (evt) => {
      const e = evt as MouseEvent
      if (isOutside(containers, e)) {
        onOutsideRef.current(e)
      }
    }

    const listenerOptions = {
      capture: true,
      passive: false,
    } as const

    const targets = eventListenTargets(containers)
    for (const target of targets) {
      target.addEventListener('mousedown', onPointerDown, listenerOptions)
      target.addEventListener('pointerdown', onPointerDown, listenerOptions)
    }

    return () => {
      for (const target of targets) {
        target.removeEventListener('mousedown', onPointerDown, listenerOptions)
        target.removeEventListener(
          'pointerdown',
          onPointerDown,
          listenerOptions as unknown as $IntentionalAny,
        )
      }
    }
  }, [container, enabled])
}
