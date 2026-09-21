import {
  getPlaygroundDistAliasesForRollup,
  playgroundUsesDistPackages,
} from '../devEnv/playgroundResolveAliases'

describe('playgroundResolveAliases', () => {
  test('dist aliases point at .mjs under dist/', () => {
    const aliases = getPlaygroundDistAliasesForRollup()
    const core = aliases.find((a) =>
      a.replacement.replace(/\\/g, '/').includes('/core/dist/index.mjs'),
    )
    expect(core).toBeDefined()
    expect(core!.replacement.replace(/\\/g, '/')).toMatch(
      /backstage\/core\/dist\/index\.mjs$/,
    )
    const anyStudioDist = aliases.some((a) =>
      a.replacement.replace(/\\/g, '/').includes('/studio/dist/'),
    )
    expect(anyStudioDist).toBe(true)
  })

  test('playgroundUsesDistPackages reads PLAYGROUND_USE_DIST', () => {
    const prev = process.env.PLAYGROUND_USE_DIST
    process.env.PLAYGROUND_USE_DIST = '1'
    expect(playgroundUsesDistPackages()).toBe(true)
    process.env.PLAYGROUND_USE_DIST = '0'
    expect(playgroundUsesDistPackages()).toBe(false)
    if (prev === undefined) {
      delete process.env.PLAYGROUND_USE_DIST
    } else {
      process.env.PLAYGROUND_USE_DIST = prev
    }
  })
})
