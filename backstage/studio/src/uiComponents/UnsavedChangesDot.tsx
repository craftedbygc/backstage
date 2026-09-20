import styled, {css} from 'styled-components'

export const STATUS_DOT_SIZE_PX = 6
export const STATUS_DOT_CORNER_OFFSET_PX = 2

export const statusDotTopLeft = css`
  position: absolute;
  top: -${STATUS_DOT_CORNER_OFFSET_PX}px;
  left: -${STATUS_DOT_CORNER_OFFSET_PX}px;
  pointer-events: none;
`

export const statusDotTopRight = css`
  position: absolute;
  top: -${STATUS_DOT_CORNER_OFFSET_PX}px;
  right: -${STATUS_DOT_CORNER_OFFSET_PX}px;
  pointer-events: none;
`

/** Orange dot matching toolbar status indicators (unsaved / conflict). */
const UnsavedChangesDot = styled.div`
  background: #f59e0b;
  width: ${STATUS_DOT_SIZE_PX}px;
  height: ${STATUS_DOT_SIZE_PX}px;
  border-radius: 50%;
  flex-shrink: 0;
`

export default UnsavedChangesDot
