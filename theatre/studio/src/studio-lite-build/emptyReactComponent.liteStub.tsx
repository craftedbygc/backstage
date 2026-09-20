import React from 'react'

/** Placeholder for sequence-editor UI excluded from the studio-lite bundle. */
const Empty: React.FC = () => null

export default Empty

/** Minimal z-index map for modules that import it from SequenceEditorPanel. */
export const zIndexes = {
  playhead: 1,
  frameStamp: 1,
  markers: 1,
  horizontalScrollbar: 1,
}
