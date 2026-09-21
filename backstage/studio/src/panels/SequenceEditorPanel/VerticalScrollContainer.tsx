import noop from '@unseenco/backstage-shared/utils/noop'
import React, {createContext, useCallback, useContext, useRef} from 'react'
import styled from 'styled-components'
import {zIndexes} from './SequenceEditorPanel'

const Container = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  overflow-x: hidden;
  overflow-y: scroll;
  z-index: ${() => zIndexes.scrollableArea};

  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
`

type ReceiveVerticalWheelEventFn = (ev: Pick<WheelEvent, 'deltaY'>) => void

const ctx = createContext<ReceiveVerticalWheelEventFn>(noop)

const scrollByContext = createContext<(deltaY: number) => void>(noop)

/**
 * See {@link VerticalScrollContainer} and references for how to use this.
 */
export const useReceiveVerticalWheelEvent = (): ReceiveVerticalWheelEventFn =>
  useContext(ctx)

export function useVerticalScrollContainerScrollBy(): (deltaY: number) => void {
  return useContext(scrollByContext)
}

/**
 * This is used in the sequence editor where we block wheel events to handle
 * pan/zoom on the time axis. The issue this solves, is that when blocking those
 * wheel events, we prevent the vertical scroll events from being fired. This container
 * comes with a context and a hook (see {@link useReceiveVerticalWheelEvent}) that allows
 * the code that traps the wheel events to pass them to the vertical scroller root, which
 * we then use to manually dispatch scroll events.
 */
const VerticalScrollContainer: React.FC<{
  children: React.ReactNode
}> = (props) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const receiveVerticalWheelEvent = useCallback<ReceiveVerticalWheelEventFn>(
    (event) => {
      ref.current!.scrollBy(0, event.deltaY)
    },
    [],
  )

  return (
    <scrollByContext.Provider
      value={(deltaY) => {
        ref.current?.scrollBy(0, deltaY)
      }}
    >
      <ctx.Provider value={receiveVerticalWheelEvent}>
        <Container ref={ref} data-sequence-editor-vertical-scroll="">
          {props.children}
        </Container>
      </ctx.Provider>
    </scrollByContext.Provider>
  )
}

export default VerticalScrollContainer
