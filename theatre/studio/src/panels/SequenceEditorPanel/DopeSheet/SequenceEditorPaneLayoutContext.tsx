import React, {createContext, useContext} from 'react'

type SequenceEditorPaneLayoutContextValue = {
  isDocked: boolean
}

const SequenceEditorPaneLayoutContext =
  createContext<SequenceEditorPaneLayoutContextValue>({isDocked: false})

export const SequenceEditorPaneLayoutProvider: React.FC<
  SequenceEditorPaneLayoutContextValue & {children: React.ReactNode}
> = ({isDocked, children}) => (
  <SequenceEditorPaneLayoutContext.Provider value={{isDocked}}>
    {children}
  </SequenceEditorPaneLayoutContext.Provider>
)

export function useSequenceEditorPaneLayout(): SequenceEditorPaneLayoutContextValue {
  return useContext(SequenceEditorPaneLayoutContext)
}
