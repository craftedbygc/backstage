import type {ISheet, ISheetObject} from '@unseenco/theatre-core'
import type {Material, Mesh, Object3D} from 'three'
import {autoAddMaterial} from './autoAddMaterial'
import {buildMaterialProps} from './buildMaterialProps'
import {buildTransformProps} from './buildTransformProps'
import type {ExcludeInput, PropPathInput} from './config'
import {getTheatreThreejsConfig, resolveAutoAddObjectOptions} from './config'
import {
  buildSheetObjectPathOptions,
  mergePropPathInputs,
} from './propPathOptions'
import {
  getMaterialEntry,
  mergeShowPropsOf,
  resolveSharedMaterialObjectKey,
  setMaterialEntry,
} from './materialRegistry'
import type {MaterialBinding} from './materialRegistry'
import {registerObjectLink} from './objectRegistry'
import type {TransientPropPath} from '@unseenco/theatre-shared/utils/transientPropPaths'

export type AutoAddObjectOptions = {
  objectKey?: string
  namespace?: string
  exclude?: ExcludeInput
  include?: ExcludeInput
  additionalConfig?: Record<string, unknown>
  trackMaterial?: boolean
  /**
   * Prop paths excluded from exported project state (merged with
   * `configureTheatreThreejs` defaults). Texture props from material parsing
   * are always transient. Use flat keys (`'visible'`, `'map'`) or dot paths
   * (`'transform.position'`, `'material.color'`).
   */
  transient?: PropPathInput
  /**
   * Prop paths saved to state but not sequenced (merged with
   * `configureTheatreThreejs` defaults).
   */
  static?: PropPathInput
}

function getMeshMaterial(object: Object3D): Material | Material[] | undefined {
  if ('material' in object) {
    return (object as Mesh).material
  }
  return undefined
}

function resolveObjectKey(
  object: Object3D,
  options: AutoAddObjectOptions,
): string {
  const baseKey = options.objectKey ?? (object.name.trim() || 'Object')
  return `${options.namespace ?? ''}${baseKey}`
}

function splitEmbeddedMaterial(args: {
  material: Material | Material[]
  sheet: ISheet
  hostSheetObject: ISheetObject
  binding: MaterialBinding
  transformOnlyConfig: Record<string, unknown>
  exclude?: AutoAddObjectOptions['exclude']
  include?: AutoAddObjectOptions['include']
  transient?: PropPathInput
  static?: PropPathInput
}): ISheetObject {
  const {
    material,
    sheet,
    hostSheetObject,
    binding,
    transformOnlyConfig,
    exclude,
    include,
    transient,
    static: staticPropPaths,
  } = args

  const materialSheetObject = autoAddMaterial(material, sheet, {
    objectKey: resolveSharedMaterialObjectKey(material),
    exclude,
    include,
    transient,
    static: staticPropPaths,
  })

  binding.applyMaterial = undefined
  const pathDefaults = getTheatreThreejsConfig().autoAddObject ?? {}
  const hostPathOptions = buildSheetObjectPathOptions(transformOnlyConfig, {
    transient: mergePropPathInputs(pathDefaults.transient, transient),
    static: mergePropPathInputs(pathDefaults.static, staticPropPaths),
  })
  hostSheetObject.reconfigure(
    transformOnlyConfig as Parameters<ISheetObject['reconfigure']>[0],
    hostPathOptions,
  )
  mergeShowPropsOf(hostSheetObject, materialSheetObject)

  setMaterialEntry(material, {
    sheetObject: materialSheetObject,
    mode: 'shared',
  })

  return materialSheetObject
}

export function autoAddObject<T extends Object3D>(
  object: T,
  sheet: ISheet,
  options: AutoAddObjectOptions = {},
): ISheetObject {
  if (!object) {
    throw new Error('autoAddObject() requires a Three.js Object3D.')
  }

  if (!sheet) {
    throw new Error('autoAddObject() requires a Theatre sheet.')
  }

  const objectKey = resolveObjectKey(object, options)
  const resolved = resolveAutoAddObjectOptions(options)
  const defaults = getTheatreThreejsConfig().autoAddObject ?? {}
  const userTransientPaths = mergePropPathInputs(
    defaults.transient,
    options.transient,
  )
  const userStaticPaths = mergePropPathInputs(defaults.static, options.static)
  const meshMaterial = getMeshMaterial(object)
  const wantsMaterial = resolved.trackMaterial ?? meshMaterial !== undefined

  const {config: transformConfig, applier: applyTransform} =
    buildTransformProps(object, {exclude: resolved.exclude.transform})

  const transformOnlyConfig: Record<string, unknown> = {
    ...transformConfig,
    ...options.additionalConfig,
  }

  const config: Record<string, unknown> = {...transformOnlyConfig}
  const binding: MaterialBinding = {}
  let transientPaths: TransientPropPath[] = []
  let shareMaterialSheetObject: ISheetObject | undefined
  let embedMaterial = false

  if (wantsMaterial && meshMaterial) {
    const existing = getMaterialEntry(meshMaterial)

    if (existing?.mode === 'shared') {
      shareMaterialSheetObject = existing.sheetObject
    } else if (existing?.mode === 'embedded' && existing.hostSheetObject) {
      shareMaterialSheetObject = splitEmbeddedMaterial({
        material: meshMaterial,
        sheet,
        hostSheetObject: existing.hostSheetObject,
        binding: existing.binding ?? {},
        transformOnlyConfig:
          existing.transformOnlyConfig ?? transformOnlyConfig,
        exclude: options.exclude,
        include: options.include,
        transient: options.transient,
        static: options.static,
      })
    } else {
      embedMaterial = true
      const {
        config: materialConfig,
        applier,
        transientPaths: materialTransientPaths,
      } = buildMaterialProps(meshMaterial, {
        excludeMaterial: resolved.exclude.material,
        excludeUniforms: resolved.exclude.uniforms,
        includeMaterial: resolved.include.material,
        includeUniforms: resolved.include.uniforms,
        getAssetUrl: (asset) => sheet.project.getAssetUrl(asset),
      })
      if (materialConfig) {
        Object.assign(config, materialConfig)
      }
      binding.applyMaterial = applier
      transientPaths = [...materialTransientPaths]
    }
  }

  const pathOptions = buildSheetObjectPathOptions(config, {
    transient: [...transientPaths, ...userTransientPaths],
    static: userStaticPaths,
  })

  const sheetObject = sheet.object(
    objectKey,
    config as Parameters<ISheet['object']>[1],
    pathOptions,
  )

  sheetObject.onValuesChange((values) => {
    applyTransform(object, values as Parameters<typeof applyTransform>[1])

    if (binding.applyMaterial) {
      const material = getMeshMaterial(object)
      if (material) {
        binding.applyMaterial(material, values as Record<string, unknown>)
      }
    }
  })

  registerObjectLink(object, sheetObject)

  if (embedMaterial && meshMaterial) {
    setMaterialEntry(meshMaterial, {
      sheetObject,
      mode: 'embedded',
      hostSheetObject: sheetObject,
      binding,
      transformOnlyConfig,
    })
  }

  if (shareMaterialSheetObject) {
    mergeShowPropsOf(sheetObject, shareMaterialSheetObject)
  }

  return sheetObject
}
