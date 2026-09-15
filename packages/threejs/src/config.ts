/** Category map of transform, material, and uniform paths to exclude from auto-add helpers. */
export type ExcludeConfig = {
  /** Transform prop keys to exclude from auto-registration. */
  transform?: readonly string[]
  /** Material prop keys to exclude from auto-registration. */
  material?: readonly string[]
  /** Shader uniform names to exclude from auto-registration. */
  uniforms?: readonly string[]
}

/** A flat list applies to transform, material props, and uniforms. */
export type ExcludeInput = readonly string[] | ExcludeConfig

/** Same shape as {@link ExcludeInput}; paths are expanded when passed to `sheet.object()`. */
export type PropPathInput = ExcludeInput

/** Default options merged into each {@link autoAddObject} call from {@link configureTheatreThreejs}. */
export type AutoAddObjectDefaults = {
  exclude?: ExcludeInput
  include?: ExcludeInput
  trackMaterial?: boolean
  transient?: PropPathInput
  static?: PropPathInput
}

/** Project-wide defaults for {@link autoAddObject} via {@link configureTheatreThreejs}. */
export type TheatreThreejsConfig = {
  autoAddObject?: AutoAddObjectDefaults
}

type ResolvedExcludeConfig = {
  transform: string[]
  material: string[]
  uniforms: string[]
}

let activeConfig: TheatreThreejsConfig = {}

function dedupe(values: string[]): string[] {
  return [...new Set(values)]
}

/**
 * Merges exclude/include inputs into per-category path lists for auto-add helpers.
 *
 * @param inputs - Flat lists and/or category objects; later inputs append to earlier ones
 * @returns Resolved transform, material, and uniform exclusion lists
 */
export function mergeExcludeInput(
  ...inputs: (ExcludeInput | undefined)[]
): ResolvedExcludeConfig {
  const result: ResolvedExcludeConfig = {
    transform: [],
    material: [],
    uniforms: [],
  }

  for (const input of inputs) {
    if (!input) continue

    if (Array.isArray(input)) {
      result.transform.push(...input)
      result.material.push(...input)
      result.uniforms.push(...input)
      continue
    }

    const config = input as ExcludeConfig
    if (config.transform) {
      result.transform.push(...config.transform)
    }
    if (config.material) {
      result.material.push(...config.material)
    }
    if (config.uniforms) {
      result.uniforms.push(...config.uniforms)
    }
  }

  return {
    transform: dedupe(result.transform),
    material: dedupe(result.material),
    uniforms: dedupe(result.uniforms),
  }
}

export function getTheatreThreejsConfig(): TheatreThreejsConfig {
  return activeConfig
}

export function setTheatreThreejsConfig(config: TheatreThreejsConfig): void {
  activeConfig = config
}

/** Clears project-wide `@unseenco/theatre-threejs` configuration back to defaults. */
export function resetTheatreThreejsConfig(): void {
  activeConfig = {}
}

/**
 * Sets project-wide defaults for `@unseenco/theatre-threejs` auto-add helpers.
 *
 * @param config - Configuration to apply until {@link resetTheatreThreejsConfig} or `reset()` from the return value
 * @returns Object with `reset()` restoring the previous config
 */
export function configureTheatreThreejs(config: TheatreThreejsConfig): {
  reset: () => void
} {
  const previousConfig = activeConfig
  activeConfig = config

  return {
    reset() {
      activeConfig = previousConfig
    },
  }
}

export function resolveAutoAddObjectOptions(
  options: {
    exclude?: ExcludeInput
    include?: ExcludeInput
    trackMaterial?: boolean
  } = {},
): {
  exclude: ResolvedExcludeConfig
  include: ResolvedExcludeConfig
  trackMaterial?: boolean
} {
  const defaults = activeConfig.autoAddObject ?? {}

  return {
    exclude: mergeExcludeInput(defaults.exclude, options.exclude),
    include: mergeExcludeInput(defaults.include, options.include),
    trackMaterial: options.trackMaterial ?? defaults.trackMaterial,
  }
}
