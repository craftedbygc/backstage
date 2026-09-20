import type Project from '@unseenco/theatre-core/projects/Project'
import type Sequence from '@unseenco/theatre-core/sequences/Sequence'
import LiteSequence from '@unseenco/theatre-core/sequences/LiteSequence'
import type SheetObject from '@unseenco/theatre-core/sheetObjects/SheetObject'
import type {
  SheetObjectActionsConfig,
  SheetObjectPropTypeConfig,
} from '@unseenco/theatre-core/sheets/TheatreSheet'
import TheatreSheet from '@unseenco/theatre-core/sheets/TheatreSheet'
import type {SheetAddress} from '@unseenco/theatre-shared/utils/addresses'
import {Atom, prism, val} from '@unseenco/theatre-dataverse'
import type {Prism} from '@unseenco/theatre-dataverse'
import type SheetTemplate from './SheetTemplate'
import type {
  ObjectAddressKey,
  SheetInstanceId,
} from '@unseenco/theatre-shared/utils/ids'
import {
  isSheetPropsObjectKey,
  SHEET_PROPS_OBJECT_KEY,
} from '@unseenco/theatre-shared/utils/sheetProps'
import type {
  TransientPropPath,
  StaticPropPath,
} from '@unseenco/theatre-shared/utils/transientPropPaths'
import type {StrictRecord} from '@unseenco/theatre-shared/utils/types'
import type {ILogger} from '@unseenco/theatre-shared/logger'
import type {SequenceVariantId} from '@unseenco/theatre-core/sequences/sequenceVariants'
import {isTheatreLiteMode} from '@unseenco/theatre-core/utils/isTheatreLiteMode'
import {getOrCreateFullSequence} from './sheetGetSequenceFull'
import {
  disposeRuntimeIntegrationsForSheet,
  enableGsapSequenceBridgeForSheet,
  reattachGsapBridgeForSheet,
  setPageScrollDriverForSheet,
  syncPageScrollDriverForSheet,
} from './sheetPageScrollAndGsapFull'
import {
  DEFAULT_SEQUENCE_VARIANT,
  validateSequenceVariantIdOrThrow,
} from '@unseenco/theatre-core/sequences/sequenceVariants'
import type {SheetSequenceMode} from '@unseenco/theatre-core/sheets/sheetSequenceMode'
import type {ScrollDriver} from '@unseenco/theatre-core/sheets/attachSheetScrollDriver'
import type {VoidFn} from '@unseenco/theatre-shared/utils/types'

type SheetObjectMap = StrictRecord<ObjectAddressKey, SheetObject>

/**
 * Future: `nativeObject` Idea is to potentially allow the user to provide their own
 * object in to the object call as a way to keep a handle to an underlying object via
 * the {@link ISheetObject}.
 *
 * For example, a THREEjs object or an HTMLElement is passed in.
 */
export type ObjectNativeObject = unknown

export default class Sheet {
  private readonly _objects: Atom<SheetObjectMap> = new Atom<SheetObjectMap>({})
  private readonly _sequences: Record<string, Sequence> = {}
  private readonly _liteSequences: Record<string, LiteSequence> = {}
  private readonly _activeSequenceVariant = new Atom<SequenceVariantId>(
    DEFAULT_SEQUENCE_VARIANT,
  )
  /**
   * When Studio is open, it sets this to control which variant is used for
   * value resolution (preview). User code can still update `_activeSequenceVariant`
   * via `setActiveSequenceVariant()` without affecting the Studio preview.
   */
  private readonly _studioPreviewVariantOverride = new Atom<
    SequenceVariantId | undefined
  >(undefined)
  private readonly _sequenceMode = new Atom<SheetSequenceMode>('time')
  readonly sequenceModeP = this._sequenceMode.pointer
  /** @internal Used by full-runtime scroll/GSAP helpers (`sheetPageScrollAndGsapFull`). */
  _pageScrollDisposer: VoidFn | undefined
  /** @internal */
  _customPageScrollDriver: ScrollDriver | undefined
  /** @internal */
  _gsapBridgeDisposer: VoidFn | undefined
  readonly activeSequenceVariantP = this._activeSequenceVariant.pointer
  readonly effectiveActiveSequenceVariantD: Prism<SequenceVariantId>
  readonly address: SheetAddress
  readonly publicApi: TheatreSheet
  readonly project: Project
  readonly objectsP = this._objects.pointer
  type: 'Theatre_Sheet' = 'Theatre_Sheet'
  readonly _logger: ILogger

  constructor(
    readonly template: SheetTemplate,
    public readonly instanceId: SheetInstanceId,
  ) {
    this._logger = template.project._logger.named('Sheet', instanceId)
    this._logger._trace('creating sheet')
    this.project = template.project
    this.address = {
      ...template.address,
      sheetInstanceId: this.instanceId,
    }

    this.publicApi = new TheatreSheet(this)

    this.effectiveActiveSequenceVariantD = prism(() => {
      const studioOverride = val(this._studioPreviewVariantOverride.pointer)
      if (studioOverride !== undefined) {
        return studioOverride
      }
      return val(this._activeSequenceVariant.pointer)
    })
  }

  /**
   * @remarks At some point, we have to reconcile the concept of "an object"
   * with that of "an element."
   */
  createObject(
    objectKey: ObjectAddressKey,
    nativeObject: ObjectNativeObject,
    config: SheetObjectPropTypeConfig,
    actions: SheetObjectActionsConfig = {},
    visibleInOutline?: boolean,
    transient?: readonly TransientPropPath[],
    staticPropPaths?: readonly StaticPropPath[],
  ): SheetObject {
    const objTemplate = this.template.getObjectTemplate(
      objectKey,
      nativeObject,
      config,
      actions,
      transient,
      staticPropPaths,
    )

    if (visibleInOutline !== undefined) {
      objTemplate.setVisibleInOutline(visibleInOutline)
    }

    const object = objTemplate.createInstance(this, nativeObject, config)

    this._objects.setByPointer((p) => p[objectKey], object)
    this.project._remoteSync.registerObject(object)

    return object
  }

  getObject(key: ObjectAddressKey): SheetObject | undefined {
    return this._objects.get()[key]
  }

  getObjects(): SheetObject[] {
    return Object.values(this._objects.get()).filter(
      (obj): obj is SheetObject =>
        !!obj && !isSheetPropsObjectKey(obj.address.objectKey),
    )
  }

  getSheetPropsObject(): SheetObject | undefined {
    return this.getObject(SHEET_PROPS_OBJECT_KEY)
  }

  deleteObject(objectKey: ObjectAddressKey) {
    const obj = this._objects.get()[objectKey]
    this._objects.reduce((state) => {
      const newState = {...state}
      delete newState[objectKey]
      return newState
    })
    if (obj) {
      this.project._remoteSync.unregisterObject(obj)
    }
  }

  /**
   * Runtime-only teardown: pause sequences, detach all objects, and remove
   * this sheet instance from the project. Persisted state is kept.
   */
  unload() {
    this.disposeRuntimeIntegrations()
    if (!isTheatreLiteMode()) {
      for (const sequence of Object.values(this._sequences)) {
        sequence.pause()
      }
    }
    for (const objectKey of Object.keys(
      this._objects.get(),
    ) as ObjectAddressKey[]) {
      this.deleteObject(objectKey)
    }
    this.project._unloadSheetInstance(this)
  }

  getSequence(variant?: SequenceVariantId): Sequence {
    const variantId = variant ?? val(this._activeSequenceVariant.pointer)
    if (isTheatreLiteMode()) {
      if (!this._liteSequences[variantId]) {
        this._liteSequences[variantId] = new LiteSequence()
      }
      return this._liteSequences[variantId]! as unknown as Sequence
    }
    return getOrCreateFullSequence(this, this._sequences, variantId)
  }

  getActiveSequenceVariant(): SequenceVariantId {
    return this._activeSequenceVariant.get()
  }

  setActiveSequenceVariant(variant: SequenceVariantId): void {
    const variantId = validateSequenceVariantIdOrThrow(
      variant,
      'sheet.setActiveSequenceVariant',
    )
    const registeredVariants = this.template.getSequenceVariants()
    if (!registeredVariants.includes(variantId)) {
      throw new Error(
        `Variant "${variantId}" is not registered on this sheet. ` +
          `Registered variants: ${registeredVariants.join(', ')}. ` +
          `Register variants via sheet.declareSequenceVariants([...]).`,
      )
    }
    this._activeSequenceVariant.set(variantId)
  }

  setStudioPreviewVariantOverride(
    variant: SequenceVariantId | undefined,
  ): void {
    if (variant === undefined) {
      this._studioPreviewVariantOverride.set(undefined)
      return
    }

    const variantId = validateSequenceVariantIdOrThrow(
      variant,
      'sheet.setStudioPreviewVariantOverride',
    )
    const registeredVariants = this.template.getSequenceVariants()
    if (!registeredVariants.includes(variantId)) {
      throw new Error(
        `Variant "${variantId}" is not registered on this sheet. ` +
          `Registered variants: ${registeredVariants.join(', ')}. ` +
          `Register variants via sheet.declareSequenceVariants([...]).`,
      )
    }
    this._studioPreviewVariantOverride.set(variantId)
  }

  getSequenceMode(): SheetSequenceMode {
    return this._sequenceMode.get()
  }

  setSequenceMode(mode: SheetSequenceMode): void {
    if (isTheatreLiteMode()) return
    if (this._sequenceMode.get() === mode) return
    this._sequenceMode.set(mode)
    syncPageScrollDriverForSheet(this)
    reattachGsapBridgeForSheet(this)
  }

  enableGsapSequenceBridge(): void {
    if (isTheatreLiteMode()) return
    enableGsapSequenceBridgeForSheet(this)
  }

  disposeRuntimeIntegrations(): void {
    if (isTheatreLiteMode()) return
    disposeRuntimeIntegrationsForSheet(this)
  }

  setPageScrollDriver(driver: ScrollDriver | undefined): void {
    if (isTheatreLiteMode()) return
    setPageScrollDriverForSheet(this, driver)
  }

  getPageScrollDriver(): ScrollDriver | undefined {
    return this._customPageScrollDriver
  }
}
