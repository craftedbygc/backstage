import type {IProject} from '@unseenco/backstage/projects/BackstageProject'
import type Project from '@unseenco/backstage/projects/Project'
import type Sequence from '@unseenco/backstage/sequences/Sequence'
import type {ISequence} from '@unseenco/backstage/sequences/BackstageSequence'
import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'
import type {ISheetObject} from '@unseenco/backstage/sheetObjects/BackstageSheetObject'
import type Sheet from '@unseenco/backstage/sheets/Sheet'
import type {ISheet} from '@unseenco/backstage/sheets/BackstageSheet'
import type {UnknownShorthandCompoundProps} from './propTypes/internals'
import type {$IntentionalAny} from '@unseenco/backstage-shared/utils/types'
import type {IRafDriver, RafDriverPrivateAPI} from './rafDrivers'
import {getCoreRafDriver, peekCoreRafDriver} from './coreTicker'

const publicAPIToPrivateAPIMap = new WeakMap()

/**
 * Given a public API object, returns the corresponding private API object.
 */
export function privateAPI<P extends {type: string}>(
  pub: P,
): P extends IProject
  ? Project
  : P extends ISheet
  ? Sheet
  : P extends ISheetObject<$IntentionalAny>
  ? SheetObject
  : P extends ISequence
  ? Sequence
  : P extends IRafDriver
  ? RafDriverPrivateAPI
  : never {
  return publicAPIToPrivateAPIMap.get(pub)
}

/**
 * Notes the relationship between a public API object and its corresponding private API object,
 * so that `privateAPI` can find it.
 */
export function setPrivateAPI(pub: IProject, priv: Project): void
export function setPrivateAPI(pub: ISheet, priv: Sheet): void
export function setPrivateAPI(pub: ISequence, priv: Sequence): void
export function setPrivateAPI(pub: IRafDriver, priv: RafDriverPrivateAPI): void
export function setPrivateAPI<Props extends UnknownShorthandCompoundProps>(
  pub: ISheetObject<Props>,
  priv: SheetObject,
): void
export function setPrivateAPI(pub: {}, priv: {}): void {
  publicAPIToPrivateAPIMap.set(pub, priv)
}

/** Used by `@unseenco/backstage/gsap` to inspect which driver drives the core ticker. */
export function getBackstageCoreRafDriver(): IRafDriver {
  return getCoreRafDriver().publicApi
}

/** Like {@link getBackstageCoreRafDriver} but does not create the default driver. */
export function peekBackstageCoreRafDriver(): IRafDriver | undefined {
  return peekCoreRafDriver()?.publicApi
}
