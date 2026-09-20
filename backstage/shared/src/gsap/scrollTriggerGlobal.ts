export function refreshGsapScrollTriggersFromGlobal(): void {
  const ScrollTrigger = (
    globalThis as typeof globalThis & {
      ScrollTrigger?: {refresh?: () => void}
    }
  ).ScrollTrigger
  ScrollTrigger?.refresh?.()
}
