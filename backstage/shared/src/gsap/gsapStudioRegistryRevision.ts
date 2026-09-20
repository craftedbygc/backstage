import {Atom} from '@unseenco/backstage/dataverse'

const revisionAtom = new Atom(0)

/** Bumped when GSAP animations register so Studio UI can refresh menus. */
export function bumpGsapStudioRegistryRevision(): void {
  revisionAtom.set(revisionAtom.get() + 1)
}

export const gsapStudioRegistryRevisionPointer = revisionAtom.pointer
