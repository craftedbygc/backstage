import type {Atom, Pointer} from '@unseenco/backstage/dataverse'

export const collapsedMap = new WeakMap<Pointer<{}>, Atom<boolean>>()
