import {
  isLitePlaygroundImporter,
  normalizeModulePath,
  rewriteTheatrePeersInSource,
} from '../devEnv/theatreLiteThreeVitePlugin'

describe('theatreLiteThreeVitePlugin', () => {
  test('normalizeModulePath uses forward slashes', () => {
    expect(
      normalizeModulePath(
        'C:\\repo\\packages\\playground\\src\\shared\\theatre-lite-three\\index.tsx',
      ),
    ).toBe(
      'C:/repo/packages/playground/src/shared/theatre-lite-three/index.tsx',
    )
  })

  test('isLitePlaygroundImporter matches theatre-lite-three with forward slashes', () => {
    expect(
      isLitePlaygroundImporter(
        '/workspace/packages/playground/src/shared/theatre-lite-three/index.tsx',
      ),
    ).toBe(true)
  })

  test('isLitePlaygroundImporter matches theatre-lite-three with Windows-style paths', () => {
    expect(
      isLitePlaygroundImporter(
        'D:\\theatre\\packages\\playground\\src\\shared\\theatre-lite-three\\index.tsx',
      ),
    ).toBe(true)
  })

  test('isLitePlaygroundImporter matches theatre-lite demo', () => {
    expect(
      isLitePlaygroundImporter(
        '/workspace/packages/playground/src/shared/theatre-lite/index.tsx',
      ),
    ).toBe(true)
  })

  test('rewriteTheatrePeersInSource rewrites core and studio package roots', () => {
    const input = `import {types} from '@unseenco/backstage'
import studio from '@unseenco/backstage/studio'
import type {IStudio} from '@unseenco/backstage/studio/TheatreStudio'`
    const out = rewriteTheatrePeersInSource(input)
    expect(out).toContain(`'@unseenco/backstage/core-lite'`)
    expect(out).toContain(`'@unseenco/backstage/studio-lite'`)
    expect(out).toContain(`'@unseenco/backstage/studio-lite/TheatreStudio'`)
  })

  test('rewriteTheatrePeersInSource is idempotent for already-lite imports', () => {
    const input = `import {types} from '@unseenco/backstage/core-lite'
import {getStudio} from '@unseenco/backstage/studio-lite'`
    const out = rewriteTheatrePeersInSource(input)
    expect(out).not.toContain('core-lite-lite')
    expect(out).not.toContain('studio-lite-lite')
    expect(out).toBe(input)
  })
})
