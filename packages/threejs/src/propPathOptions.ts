import {compound} from '@unseenco/theatre-core/propTypes'
import type {ISheetObjectOptions} from '@unseenco/theatre-core'
import type {PropTypeConfig} from '@unseenco/theatre-core/propTypes'
import {getPropConfigByPath} from '@unseenco/theatre-shared/propTypes/utils'
import type {
  StaticPropPath,
  TransientPropPath,
} from '@unseenco/theatre-shared/utils/transientPropPaths'
import {parseTransientPropPath} from '@unseenco/theatre-shared/utils/transientPropPaths'
import type {ExcludeConfig, PropPathInput} from './config'
import {mergeExcludeInput} from './config'

export type {PropPathInput} from './config'

function dedupePropPaths(paths: TransientPropPath[]): TransientPropPath[] {
  const seen = new Set<string>()
  const result: TransientPropPath[] = []

  for (const path of paths) {
    const key =
      typeof path === 'string' ? path : path.map((segment) => String(segment)).join('.')
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

export function expandPropPathInput(input?: PropPathInput): TransientPropPath[] {
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
    paths.push(...categorizedPropPathsToTheatrePaths(mergeExcludeInput(shortKeys)))
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
  config: PropTypeConfig,
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
  const compoundConfig = compound(
    config as Parameters<typeof compound>[0],
  ) as PropTypeConfig

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
