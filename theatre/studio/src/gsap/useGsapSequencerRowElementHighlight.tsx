import type {SequenceEditorTree_AllRowTypes} from '@unseenco/theatre-studio/panels/SequenceEditorPanel/layout/tree'
import {useDomElementHighlight} from '@unseenco/theatre-studio/gsap/useDomElementHighlight'
import {
  isGsapSequencerHighlightRow,
  resolveGsapSequencerRowHighlightElement,
} from '@unseenco/theatre-studio/gsap/resolveGsapSequencerRowHighlightElement'
import {useLayoutEffect} from 'react'

export function useGsapSequencerRowElementHighlight(
  node: HTMLElement | null,
  leaf: SequenceEditorTree_AllRowTypes,
): void {
  const {showElementHighlight, hideElementHighlight} = useDomElementHighlight()

  useLayoutEffect(() => {
    if (!node || !isGsapSequencerHighlightRow(leaf)) {
      return
    }

    const onMouseEnter = () => {
      const element = resolveGsapSequencerRowHighlightElement(leaf)
      if (element) {
        showElementHighlight(element)
      }
    }
    const onMouseLeave = () => {
      hideElementHighlight()
    }

    node.addEventListener('mouseenter', onMouseEnter)
    node.addEventListener('mouseleave', onMouseLeave)

    return () => {
      hideElementHighlight()
      node.removeEventListener('mouseenter', onMouseEnter)
      node.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [node, leaf, showElementHighlight, hideElementHighlight])
}
