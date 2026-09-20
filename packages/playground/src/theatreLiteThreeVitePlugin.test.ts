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
    ).toBe('C:/repo/packages/playground/src/shared/theatre-lite-three/index.tsx')
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
    const input = `import {types} from '@unseenco/theatre-core'
import studio from '@unseenco/theatre-studio'
import type {IStudio} from '@unseenco/theatre-studio/TheatreStudio'`
    const out = rewriteTheatrePeersInSource(input)
    expect(out).toContain(`'@unseenco/theatre-core-lite'`)
    expect(out).toContain(`'@unseenco/theatre-studio-lite'`)
    expect(out).toContain(`'@unseenco/theatre-studio-lite/TheatreStudio'`)
  })
})
