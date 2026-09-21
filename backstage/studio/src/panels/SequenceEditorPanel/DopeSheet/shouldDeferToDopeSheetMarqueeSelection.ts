/** Shift+drag on the dope sheet is reserved for marquee keyframe selection. */
export function shouldDeferToDopeSheetMarqueeSelection(
  event: MouseEvent,
): boolean {
  return event.shiftKey
}
