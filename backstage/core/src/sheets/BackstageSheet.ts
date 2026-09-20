import {privateAPI, setPrivateAPI} from '@unseenco/backstage/privateAPIs'
import type {IProject} from '@unseenco/backstage/projects/BackstageProject'
import type {ISequence} from '@unseenco/backstage/sequences/BackstageSequence'
import type {PropTypeConfig_Compound} from '@unseenco/backstage/propTypes'
import {compound} from '@unseenco/backstage/propTypes'
import type {ISheetObject} from '@unseenco/backstage/sheetObjects/BackstageSheetObject'
import type Sheet from '@unseenco/backstage/sheets/Sheet'
import type {ScrollDriver} from '@unseenco/backstage/sheets/attachSheetScrollDriver'
import type {SheetAddress} from '@unseenco/backstage-shared/utils/addresses'
import {InvalidArgumentError} from '@unseenco/backstage-shared/utils/errors'
import {validateAndSanitiseSlashedPathOrThrow} from '@unseenco/backstage-shared/utils/slashedPaths'
import {parseOutlineNamespacePath} from '@unseenco/backstage-shared/utils/outlineNamespaces'
import type {$IntentionalAny} from '@unseenco/backstage-shared/utils/types'
import userReadableTypeOfValue from '@unseenco/backstage-shared/utils/userReadableTypeOfValue'
import deepEqual from 'fast-deep-equal'
import type {
  UnknownShorthandCompoundProps,
  UnknownValidCompoundProps,
} from '@unseenco/backstage/propTypes/internals'
import type {ObjectAddressKey} from '@unseenco/backstage-shared/utils/ids'
import {
  isSheetPropsObjectKey,
  SHEET_PROPS_OBJECT_KEY,
} from '@unseenco/backstage-shared/utils/sheetProps'
import type {SequenceVariantId} from '@unseenco/backstage/sequences/sequenceVariants'
import {notify} from '@unseenco/backstage-shared/notify'
import type {
  TransientPropPath,
  StaticPropPath,
} from '@unseenco/backstage-shared/utils/transientPropPaths'
import {resolveShowPropsOfSources} from '@unseenco/backstage/sheetObjects/resolveShowPropsOf'
import {
  getUnsanitizedObjectProps,
  setUnsanitizedObjectProps,
} from '@unseenco/backstage/sheetObjects/unsanitizedObjectProps'

export type SheetObjectPropTypeConfig =
  PropTypeConfig_Compound<UnknownValidCompoundProps>

export type SheetObjectAction = (object: ISheetObject) => void

export type SheetObjectActionsConfig = Record<string, SheetObjectAction>

/** Options for {@link ISheet.object} beyond prop definitions (visibility, showPropsOf, etc.). */
export type ISheetObjectOptions = {
  reconfigure?: boolean
  /**
   * Whether the object appears in the Studio outline panel. Defaults to `true`.
   */
  visible?: boolean
  /**
   * Other sheet objects whose props are shown in this object's Studio details
   * pane. Runtime-only (not persisted). Edits and sequencing still target the
   * source objects. Same-sheet only; cannot include the host object.
   *
   * @example
   * ```ts
   * const appearance = sheet.object('Appearance', {color: types.rgba()})
   * sheet.object('Box', {x: 0}, {showPropsOf: [appearance]})
   * ```
   */
  showPropsOf?: ISheetObject<any>[]
  /**
   * Prop paths that are excluded from exported project state JSON.
   * Values are stored in ahistoric static overrides (persist across Studio
   * reloads) but never written to historic state or sequence tracks.
   *
   * Paths accept dot notation (`'foo.bar'`) or arrays (`['foo', 'bar']`).
   * A prefix path like `'foo'` marks the entire subtree as transient.
   */
  transient?: readonly TransientPropPath[]
  /**
   * Prop paths that cannot be sequenced but are saved to exported project state.
   *
   * Paths accept dot notation (`'foo.bar'`) or arrays (`['foo', 'bar']`).
   * A prefix path like `'foo'` marks the entire subtree as static.
   */
  static?: readonly StaticPropPath[]
  __actions__THIS_API_IS_UNSTABLE_AND_WILL_CHANGE_IN_THE_NEXT_VERSION?: SheetObjectActionsConfig
}

export type ISheetPropsOptions = Omit<
  ISheetObjectOptions,
  'visible' | 'showPropsOf'
>

/** Public API for a Backstage.js sheet (objects, sequence, and runtime lifecycle). */
export interface ISheet {
  /**
   * All sheets have `sheet.type === 'Backstage_Sheet_PublicAPI'`
   */
  readonly type: 'Backstage_Sheet_PublicAPI'

  /**
   * The Project this Sheet belongs to
   */
  readonly project: IProject

  /**
   * The address of the Sheet
   */
  readonly address: SheetAddress

  /**
   * Creates a child object for the sheet
   *
   * **Docs: https://backstage.unseen.co/docs/guide/manual/objects**
   *
   * @param key - Each object is identified by a key, which is a non-empty string
   * @param props - The props of the object. See examples
   * @param options - (Optional) Provide `{reconfigure: true}` to reconfigure an existing object, `{visible: false}` to hide it from the Studio outline panel, or `{actions: { ... }}` to add custom buttons to the UI. Read the example below for details.
   *
   * @returns An Object
   *
   * @example
   * Usage:
   * ```ts
   * // Create an object named "a unique key" with no props
   * const obj = sheet.object("a unique key", {})
   * obj.address.objectKey // "a unique key"
   *
   *
   * // Create an object with {x: 0}
   * const obj = sheet.object("obj", {x: 0})
   * obj.value.x // returns 0 or the current number that the user has set
   *
   * // Create an object with nested props
   * const obj = sheet.object("obj", {position: {x: 0, y: 0}})
   * obj.value.position // {x: 0, y: 0}
   *
   * // you can also reconfigure an existing object:
   * const obj = sheet.object("obj", {foo: 0})
   * console.log(object.value.foo) // prints 0
   *
   * const obj2 = sheet.object("obj", {bar: 0}, {reconfigure: true})
   * console.log(object.value.foo) // prints undefined, since we've removed this prop via reconfiguring the object
   * console.log(object.value.bar) // prints 0, since we've introduced this prop by reconfiguring the object
   *
   * assert(obj === obj2) // passes, because reconfiguring the object returns the same object
   *
   * // you can add custom actions to an object:
   * const obj = sheet.object("obj", {foo: 0}, {
   *   actions: {
   *     // This will display a button in the UI that will reset the value of `foo` to 0
   *     Reset: () => {
   *       studio.transaction((api) => {
   *         api.set(obj.props.foo, 0)
   *       })
   *     }
   *   }
   * })
   *
   * // you can mark props as transient (excluded from exported state JSON):
   * const obj = sheet.object("Camera", {
   *   fov: 50,
   *   orbitEnabled: false,
   * }, {
   *   transient: ['orbitEnabled']
   * })
   *
   * // static props are saved to state but cannot be sequenced:
   * const obj = sheet.object("Camera", { fov: 50, zoom: 1 }, {
   *   static: ['zoom']
   * })
   * ```
   */
  object<Props extends UnknownShorthandCompoundProps>(
    key: string,
    props: Props,
    options?: ISheetObjectOptions,
  ): ISheetObject<Props>

  /**
   * Declares props scoped to the sheet (not a scene object). The returned handle
   * behaves like a sheet object for `props`, `value`, `onValuesChange`, and
   * Studio editing, but is hidden from {@link ISheet.getObjects} and the outline.
   *
   * Sheet props are shared across all sequence variants (static and sequenced).
   */
  props<Props extends UnknownShorthandCompoundProps>(
    config: Props,
    options?: ISheetPropsOptions,
  ): ISheetObject<Props>

  /**
   * Detaches a previously created child object from the sheet.
   *
   * If you call `sheet.object(key)` again with the same `key`, the object's values of the object's
   * props WILL NOT be reset to their initial values.
   *
   * @param key - The `key` of the object previously given to `sheet.object(key, ...)`.
   */
  detachObject(key: string): void

  /**
   * Returns all currently attached objects on this sheet.
   *
   * Use with {@link ISheet.detachObject} to detach individual objects.
   */
  getObjects(): ISheetObject[]

  /**
   * Unloads this sheet instance from memory: detaches all objects, pauses
   * sequences, and removes the sheet from the project.
   *
   * Runtime-only: persisted prop overrides and sequence data are kept. Calling
   * `project.sheet` again with the same id recreates the sheet.
   */
  unload(): void

  /**
   * Declares an outline namespace folder in the Studio. The folder appears in
   * the outline panel even before any sheet objects are added under it.
   *
   * You can also use this to set the default collapsed state for a namespace
   * folder. The default only applies when the user has not manually expanded
   * or collapsed the folder yet.
   *
   * This method is part of `@unseenco/backstage` so you can configure outline folders
   * without importing `@unseenco/backstage/studio`.
   *
   * @param namespacePath - The namespace path, e.g. `"My Folder"` or `"My Folder / Subfolder"`
   * @param opts - Optional configuration for the namespace folder
   *
   * @example
   * ```ts
   * const sheet = project.sheet('Scene')
   *
   * // Create an empty folder ahead of time, collapsed by default
   * sheet.declareOutlineNamespace('Props', {collapsed: true})
   *
   * // Later, add objects under that folder
   * sheet.object('Props / Chair', {x: 0})
   * sheet.object('Props / Table', {x: 0})
   * ```
   */
  declareOutlineNamespace(
    namespacePath: string,
    opts?: {collapsed?: boolean},
  ): void

  /**
   * Sets whether a namespace folder in the Studio outline panel is collapsed.
   *
   * Call this on load to force a folder closed every time your app starts.
   * Unlike `declareOutlineNamespace()`, this overrides any previous user
   * preference for the current session's initial render.
   *
   * @param namespacePath - The namespace path, e.g. `"My Folder"` or `"My Folder / Subfolder"`
   * @param collapsed - Whether the folder should be collapsed
   *
   * @example
   * ```ts
   * const sheet = project.sheet('Scene')
   *
   * // Force a folder closed every time your app loads
   * sheet.setOutlineNamespaceCollapsed('Props', true)
   * ```
   */
  setOutlineNamespaceCollapsed(namespacePath: string, collapsed: boolean): void

  /**
   * The Sequence of this Sheet (uses the currently active sequence variant)
   */
  readonly sequence: ISequence

  /**
   * Declares the sequence variants available on this sheet. Each variant has its own
   * independent sequence data, allowing the same properties to be animated differently
   * per variant (e.g. mobile vs desktop).
   *
   * The `"default"` variant is always required and is included automatically if omitted.
   *
   * @param variants - An array of variant names (each at least 3 characters long)
   *
   * @example
   * ```ts
   * const sheet = project.sheet('Scene')
   * sheet.declareSequenceVariants(['default', 'mobile', 'desktop'])
   * sheet.setActiveSequenceVariant('mobile')
   * ```
   */
  declareSequenceVariants(variants: SequenceVariantId[]): void

  /**
   * Sets which sequence variant is currently active. The active variant determines
   * which sequence's keyframes are used when computing prop values, and which sequence
   * `sheet.sequence` refers to.
   */
  setActiveSequenceVariant(variant: SequenceVariantId): void

  /**
   * Returns the currently active sequence variant name.
   */
  getActiveSequenceVariant(): SequenceVariantId

  /**
   * Whether the sequence uses wall-clock time (default) or page-scroll percent units.
   * Page mode is runtime-only and not persisted in project state.
   */
  getSequenceMode(): 'time' | 'page'

  /**
   * Switches sequence units: `time` (seconds) or `page` (0–100 = scroll percent).
   * In page mode, length is fixed at 100 and snap grid uses 0.1% steps.
   */
  setSequenceMode(mode: 'time' | 'page'): void

  /**
   * Overrides the scroll driver used in page mode (e.g. Lenis). Pass `undefined` to
   * restore native document scroll. Re-attaches the scroll → playhead listener.
   */
  setPageScrollDriver(driver: ScrollDriver | undefined): void
}

export default class BackstageSheet implements ISheet {
  get type(): 'Backstage_Sheet_PublicAPI' {
    return 'Backstage_Sheet_PublicAPI'
  }
  /**
   * @internal
   */
  constructor(sheet: Sheet) {
    setPrivateAPI(this, sheet)
  }

  object<Props extends UnknownShorthandCompoundProps>(
    key: string,
    config: Props,
    opts?: ISheetObjectOptions,
  ): ISheetObject<Props> {
    const internal = privateAPI(this)
    const sanitizedPath = validateAndSanitiseSlashedPathOrThrow(
      key,
      `sheet.object`,
    )

    if (isSheetPropsObjectKey(sanitizedPath)) {
      throw new InvalidArgumentError(
        `The key "${sanitizedPath}" is reserved for sheet-level props. Use sheet.props() instead of sheet.object().`,
      )
    }

    const existingObject = internal.getObject(sanitizedPath as ObjectAddressKey)

    /**
     * Future: `nativeObject` Idea is to potentially allow the user to provide their own
     * object in to the object call as a way to keep a handle to an underlying object via
     * the {@link ISheetObject}.
     *
     * For example, a THREEjs object or an HTMLElement is passed in.
     */
    const nativeObject = null

    const actions =
      opts?.__actions__THIS_API_IS_UNSTABLE_AND_WILL_CHANGE_IN_THE_NEXT_VERSION

    if (existingObject) {
      if (process.env.NODE_ENV !== 'production') {
        const prevConfig = getUnsanitizedObjectProps(existingObject)
        if (prevConfig) {
          if (!deepEqual(config, prevConfig)) {
            if (opts?.reconfigure === true) {
              const sanitizedConfig = compound(config)
              existingObject.template.reconfigure(sanitizedConfig)
              if (opts.transient !== undefined) {
                existingObject.template.setTransientPropPaths(
                  opts.transient,
                  sanitizedConfig,
                )
              }
              if (opts.static !== undefined) {
                existingObject.template.setStaticPropPaths(
                  opts.static,
                  sanitizedConfig,
                )
              }
              if (opts.showPropsOf !== undefined) {
                existingObject.template.setShowPropsOf(
                  resolveShowPropsOfSources(
                    existingObject,
                    opts.showPropsOf,
                    `sheet.object(..., {showPropsOf})`,
                  ),
                )
              }
              setUnsanitizedObjectProps(existingObject, config)
              return existingObject.publicApi as $IntentionalAny
            } else {
              throw new Error(
                `You seem to have called sheet.object("${key}", config) twice, with different values for \`config\`. ` +
                  `This is disallowed because changing the config of an object on the fly would make it difficult to reason about.\n\n` +
                  `You can fix this by either re-using the existing object, or calling sheet.object("${key}", config) with the same config.\n\n` +
                  `If you mean to reconfigure the object's config, set \`{reconfigure: true}\` in sheet.object("${key}", config, {reconfigure: true})`,
              )
            }
          }
        }
      }

      if (actions) {
        existingObject.template._temp_setActions(actions)
      }

      if (opts?.visible !== undefined) {
        existingObject.template.setVisibleInOutline(opts.visible)
      }

      if (opts?.transient !== undefined) {
        existingObject.template.setTransientPropPaths(
          opts.transient,
          existingObject.template.staticConfig,
        )
      }

      if (opts?.static !== undefined) {
        existingObject.template.setStaticPropPaths(
          opts.static,
          existingObject.template.staticConfig,
        )
      }

      if (opts?.showPropsOf !== undefined) {
        existingObject.template.setShowPropsOf(
          resolveShowPropsOfSources(
            existingObject,
            opts.showPropsOf,
            `sheet.object(..., {showPropsOf})`,
          ),
        )
      }

      return existingObject.publicApi as $IntentionalAny
    } else {
      const sanitizedConfig = compound(config)
      const object = internal.createObject(
        sanitizedPath as ObjectAddressKey,
        nativeObject,
        sanitizedConfig,
        actions,
        opts?.visible,
        opts?.transient,
        opts?.static,
      )
      if (process.env.NODE_ENV !== 'production') {
        setUnsanitizedObjectProps(object, config)
      }
      if (opts?.showPropsOf !== undefined) {
        object.template.setShowPropsOf(
          resolveShowPropsOfSources(
            object,
            opts.showPropsOf,
            `sheet.object(..., {showPropsOf})`,
          ),
        )
      }
      return object.publicApi as $IntentionalAny
    }
  }

  props<Props extends UnknownShorthandCompoundProps>(
    config: Props,
    opts?: ISheetPropsOptions,
  ): ISheetObject<Props> {
    const internal = privateAPI(this)
    const objectKey = SHEET_PROPS_OBJECT_KEY
    const existingObject = internal.getSheetPropsObject()

    const nativeObject = null
    const actions =
      opts?.__actions__THIS_API_IS_UNSTABLE_AND_WILL_CHANGE_IN_THE_NEXT_VERSION

    if (existingObject) {
      if (process.env.NODE_ENV !== 'production') {
        const prevConfig = getUnsanitizedObjectProps(existingObject)
        if (prevConfig) {
          if (!deepEqual(config, prevConfig)) {
            if (opts?.reconfigure === true) {
              const sanitizedConfig = compound(config)
              existingObject.template.reconfigure(sanitizedConfig)
              if (opts.transient !== undefined) {
                existingObject.template.setTransientPropPaths(
                  opts.transient,
                  sanitizedConfig,
                )
              }
              if (opts.static !== undefined) {
                existingObject.template.setStaticPropPaths(
                  opts.static,
                  sanitizedConfig,
                )
              }
              setUnsanitizedObjectProps(existingObject, config)
              return existingObject.publicApi as $IntentionalAny
            } else {
              throw new Error(
                `You seem to have called sheet.props(config) twice, with different values for \`config\`. ` +
                  `Use the same config on repeat calls, or pass \`{reconfigure: true}\` to change the schema.`,
              )
            }
          }
        }
      }

      if (actions) {
        existingObject.template._temp_setActions(actions)
      }

      if (opts?.transient !== undefined) {
        existingObject.template.setTransientPropPaths(
          opts.transient,
          existingObject.template.staticConfig,
        )
      }

      if (opts?.static !== undefined) {
        existingObject.template.setStaticPropPaths(
          opts.static,
          existingObject.template.staticConfig,
        )
      }

      return existingObject.publicApi as $IntentionalAny
    }

    const sanitizedConfig = compound(config)
    const object = internal.createObject(
      objectKey,
      nativeObject,
      sanitizedConfig,
      actions,
      false,
      opts?.transient,
      opts?.static,
    )
    if (process.env.NODE_ENV !== 'production') {
      setUnsanitizedObjectProps(object, config)
    }
    return object.publicApi as $IntentionalAny
  }

  get sequence(): ISequence {
    return privateAPI(this).getSequence().publicApi
  }

  declareSequenceVariants(variants: SequenceVariantId[]): void {
    privateAPI(this).template.declareSequenceVariants(variants)
  }

  setActiveSequenceVariant(variant: SequenceVariantId): void {
    privateAPI(this).setActiveSequenceVariant(variant)
  }

  getActiveSequenceVariant(): SequenceVariantId {
    return privateAPI(this).getActiveSequenceVariant()
  }

  getSequenceMode(): 'time' | 'page' {
    return privateAPI(this).getSequenceMode()
  }

  setSequenceMode(mode: 'time' | 'page'): void {
    privateAPI(this).setSequenceMode(mode)
  }

  setPageScrollDriver(driver: ScrollDriver | undefined): void {
    privateAPI(this).setPageScrollDriver(driver)
  }

  get project(): IProject {
    return privateAPI(this).project.publicApi
  }

  get address(): SheetAddress {
    return {...privateAPI(this).address}
  }

  detachObject(key: string) {
    const internal = privateAPI(this)
    const sanitizedPath = validateAndSanitiseSlashedPathOrThrow(
      key,
      `sheet.deleteObject("${key}")`,
    ) as ObjectAddressKey

    if (isSheetPropsObjectKey(sanitizedPath)) {
      throw new InvalidArgumentError(
        `Sheet props cannot be detached. They are removed when the sheet instance is unloaded.`,
      )
    }

    const obj = internal.getObject(sanitizedPath)
    if (!obj) {
      notify.warning(
        `Couldn\'t delete object "${sanitizedPath}"`,
        `There is no object with key "${sanitizedPath}".

To fix this, make sure you are calling \`sheet.deleteObject("${sanitizedPath}")\` with the correct key.`,
      )
      console.warn(`Object key "${sanitizedPath}" does not exist.`)
      return
    }

    internal.deleteObject(sanitizedPath as ObjectAddressKey)
  }

  getObjects(): ISheetObject[] {
    return privateAPI(this)
      .getObjects()
      .map((obj) => obj.publicApi)
  }

  unload(): void {
    privateAPI(this).unload()
  }

  declareOutlineNamespace(
    namespacePath: string,
    opts?: {collapsed?: boolean},
  ): void {
    const internal = privateAPI(this)
    const parsedPath = parseOutlineNamespacePath(
      namespacePath,
      'sheet.declareOutlineNamespace',
    )
    internal.template.setOutlineNamespaceConfig(parsedPath.join(' / '), {
      defaultCollapsed: opts?.collapsed,
    })
  }

  setOutlineNamespaceCollapsed(
    namespacePath: string,
    collapsed: boolean,
  ): void {
    const internal = privateAPI(this)
    const parsedPath = parseOutlineNamespacePath(
      namespacePath,
      'sheet.setOutlineNamespaceCollapsed',
    )
    internal.template.setOutlineNamespaceConfig(parsedPath.join(' / '), {
      collapsed,
    })
  }
}

const validateSequenceNameOrThrow = (value: string) => {
  if (typeof value !== 'string') {
    throw new InvalidArgumentError(
      `Argument 'name' in \`sheet.getSequence(name)\` must be a string. Instead, it was ${userReadableTypeOfValue(
        value,
      )}.`,
    )
  }

  const idTrimmed = value.trim()
  if (idTrimmed.length !== value.length) {
    throw new InvalidArgumentError(
      `Argument 'name' in \`sheet.getSequence("${value}")\` should not have surrounding whitespace.`,
    )
  }

  if (idTrimmed.length < 3) {
    throw new InvalidArgumentError(
      `Argument 'name' in \`sheet.getSequence("${value}")\` should be at least 3 characters long.`,
    )
  }
}
