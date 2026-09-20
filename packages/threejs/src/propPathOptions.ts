import {types} from '@unseenco/backstage'
import type {ISheetObjectOptions} from '@unseenco/backstage'
import type {ExcludeConfig, PropPathInput} from './config'
import {mergeExcludeInput} from './config'

export type {PropPathInput} from './config'

type PathToProp = (string | number)[]

export type TransientPropPath = string | readonly (string | number)[]

/** Same path format as {@link TransientPropPath}. */
export type StaticPropPath = TransientPropPath

type PropTypeConfigLike = {
  type: string
  props?: Record<string, PropTypeConfigLike>
  cases?: Record<string, PropTypeConfigLike>
}

function parseTransientPropPath(input: TransientPropPath): PathToProp {
  if (typeof input === 'string') {
    if (input.length === 0) {
      throw new Error(
        `Transient prop path cannot be an empty string. Use a dot-separated path like "foo.bar".`,
      )
    }
    return input.split('.')
  }
  return [...input]
}

function isPropConfigComposite(
  config: PropTypeConfigLike,
): config is PropTypeConfigLike & {
  props?: Record<string, PropTypeConfigLike>
  cases?: Record<string, PropTypeConfigLike>
} {
  return config.type === 'compound' || config.type === 'enum'
}

function getPropConfigByPath(
  parentConf: PropTypeConfigLike | undefined,
  path: PathToProp,
): PropTypeConfigLike | undefined {
  if (!parentConf) return undefined
  const [key, ...rest] = path
  if (key === undefined) return parentConf
  if (!isPropConfigComposite(parentConf)) return undefined

  const sub =
    parentConf.type === 'enum'
      ? parentConf.cases?.[String(key)]
      : parentConf.props?.[String(key)]

  return getPropConfigByPath(sub, rest)
}

function dedupePropPaths(paths: TransientPropPath[]): TransientPropPath[] {
  const seen = new Set<string>()
  const result: TransientPropPath[] = []

  for (const path of paths) {
    const key =
      typeof path === 'string'
        ? path
        : path.map((segment) => String(segment)).join('.')
    if (seen.has(key)) continue
    seen.add(key)
    result.push(path)
  }

  return result
}

function categorizedPropPathsToTheatrePaths(
  categorized: ReturnType<typeof mergeExcludeInput>,
): TransientPropPath[] {
  const paths: TransientPropPath[] = []

  for (const key of categorized.transform) {
    if (key === 'visible') {
      paths.push('visible')
    } else {
      paths.push(`transform.${key}`)
    }
  }

  for (const key of categorized.material) {
    paths.push(`material.${key}`)
  }

  for (const key of categorized.uniforms) {
    paths.push(`material.uniforms.${key}`)
  }

  return paths
}

export function expandPropPathInput(
  input?: PropPathInput,
): TransientPropPath[] {
  if (!input) return []

  const paths: TransientPropPath[] = []

  if (Array.isArray(input)) {
    const shortKeys: ExcludeConfig = {}
    for (const entry of input) {
      if (entry.includes('.')) {
        paths.push(entry)
      } else {
        shortKeys.transform = [...(shortKeys.transform ?? []), entry]
        shortKeys.material = [...(shortKeys.material ?? []), entry]
        shortKeys.uniforms = [...(shortKeys.uniforms ?? []), entry]
      }
    }
    paths.push(
      ...categorizedPropPathsToTheatrePaths(mergeExcludeInput(shortKeys)),
    )
  } else {
    paths.push(...categorizedPropPathsToTheatrePaths(mergeExcludeInput(input)))
  }

  return dedupePropPaths(paths)
}

export function mergePropPathInputs(
  ...inputs: (PropPathInput | undefined)[]
): TransientPropPath[] {
  return dedupePropPaths(inputs.flatMap((input) => expandPropPathInput(input)))
}

export function filterPropPathsMatchingConfig(
  paths: readonly TransientPropPath[],
  config: PropTypeConfigLike,
): TransientPropPath[] {
  return paths.filter((rawPath) => {
    const pathToProp = parseTransientPropPath(rawPath)
    return getPropConfigByPath(config, pathToProp) !== undefined
  })
}

export function buildSheetObjectPathOptions(
  config: Record<string, unknown>,
  options: {
    transient?: readonly TransientPropPath[]
    static?: readonly StaticPropPath[]
  },
): ISheetObjectOptions | undefined {
  const compoundConfig = types.compound(
    config as Parameters<typeof types.compound>[0],
  ) as PropTypeConfigLike

  const transient = filterPropPathsMatchingConfig(
    options.transient ?? [],
    compoundConfig,
  )
  const staticPaths = filterPropPathsMatchingConfig(
    options.static ?? [],
    compoundConfig,
  )

  if (transient.length === 0 && staticPaths.length === 0) {
    return undefined
  }

  const result: ISheetObjectOptions = {}
  if (transient.length > 0) {
    result.transient = transient
  }
  if (staticPaths.length > 0) {
    result.static = staticPaths
  }
  return result
}
