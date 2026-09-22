import type React from 'react'

export type NearbyKeyframesControls = {
  cur: {type: 'off'; toggle: () => void}
}

export const nextPrevCursorsTheme = {
  onColor: '#C4C4C4',
}

const NextPrevKeyframeCursors: React.FC<{
  nearbyKeyframes: NearbyKeyframesControls
}> = () => null

export default NextPrevKeyframeCursors
