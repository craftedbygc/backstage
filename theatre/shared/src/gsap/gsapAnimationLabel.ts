/** Reads GSAP tween/timeline `vars.id` when present. */
export function readGsapAnimationVarsId(
  animation: unknown,
): string | undefined {
  const id = (animation as {vars?: {id?: string}}).vars?.id
  if (typeof id === 'string' && id.trim().length > 0) {
    return id.trim()
  }
  return undefined
}

/**
 * Outline / sequencer label for a registered GSAP animation:
 * explicit `options.label`, then `vars.id`, then fallback.
 */
export function resolveGsapAnimationRegistrationLabel(
  animation: unknown,
  optionsLabel: string | undefined,
  fallback = 'GSAP animation',
): string {
  if (typeof optionsLabel === 'string' && optionsLabel.length > 0) {
    return optionsLabel
  }
  return readGsapAnimationVarsId(animation) ?? fallback
}
