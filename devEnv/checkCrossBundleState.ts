/**
 * CI guard: published core and gsap bundles must share `backstage/shared` mutable state.
 * Run after `yarn cli build` from the repo root.
 */
import path from 'path'

const repoRoot = path.join(__dirname, '..')
const coreEntry = path.join(
  repoRoot,
  'packages/backstage/dist/core/index.js',
)
const gsapEntry = path.join(repoRoot, 'packages/backstage/dist/gsap/index.js')

const revisionGlobalKey =
  '__unseenco_backstage_gsap_studio_registry_revision_v1__'

function readRegistryRevision(): number {
  const atom = (
    globalThis as typeof globalThis & {
      [revisionGlobalKey]?: {get: () => number}
    }
  )[revisionGlobalKey]
  if (!atom || typeof atom.get !== 'function') {
    throw new Error(
      `Expected gsap studio registry revision Atom at globalThis.${revisionGlobalKey}`,
    )
  }
  return atom.get()
}

function main(): void {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const core = require(coreEntry) as {
    getActivePageScrollContext: () => {axis?: string}
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const gsap = require(gsapEntry) as {
    configureBackstageGsap: (config: {
      pageScroll?: {axis?: 'vertical' | 'horizontal'}
    }) => void
    registerAnimationInRegistry: (entry: {
      id: string
      label: string
      animation: {
        totalDuration?: () => number
        duration?: () => number
        pause?: () => void
      }
    }) => void
  }

  if (core.getActivePageScrollContext().axis !== 'vertical') {
    throw new Error(
      'Expected default page scroll axis vertical before configuration',
    )
  }

  gsap.configureBackstageGsap({pageScroll: {axis: 'horizontal'}})

  const axis = core.getActivePageScrollContext().axis
  if (axis !== 'horizontal') {
    throw new Error(
      `Page scroll axis not shared across bundles: core saw "${axis}" after gsap set horizontal`,
    )
  }

  const revisionBefore = readRegistryRevision()
  gsap.registerAnimationInRegistry({
    id: 'cross-bundle-check',
    label: 'check',
    animation: {
      totalDuration: () => 0,
      duration: () => 0,
      pause: () => {},
    },
  })
  const revisionAfter = readRegistryRevision()
  if (revisionAfter !== revisionBefore + 1) {
    throw new Error(
      `GSAP studio registry revision not shared across bundles: before=${revisionBefore} after=${revisionAfter}`,
    )
  }

  console.log('checkCrossBundleState: ok')
}

main()
