import {
  isLitePlaygroundImporter,
  normalizeModulePath,
  rewriteBackstagePeersInSource,
} from '../devEnv/backstageLiteThreeVitePlugin'

describe('backstageLiteThreeVitePlugin', () => {
  test('normalizeModulePath uses forward slashes', () => {
    expect(
      normalizeModulePath(
        'C:\\repo\\packages\\playground\\src\\shared\\backstage-lite-three\\index.tsx',
      ),
    ).toBe(
      'C:/repo/packages/playground/src/shared/backstage-lite-three/index.tsx',
    )
  })

  test('isLitePlaygroundImporter matches backstage-lite-three with forward slashes', () => {
    expect(
      isLitePlaygroundImporter(
        '/workspace/packages/playground/src/shared/backstage-lite-three/index.tsx',
      ),
    ).toBe(true)
  })

  test('isLitePlaygroundImporter matches backstage-lite-three with Windows-style paths', () => {
    expect(
      isLitePlaygroundImporter(
        'D:\\backstage\\packages\\playground\\src\\shared\\backstage-lite-three\\index.tsx',
      ),
    ).toBe(true)
  })

  test('isLitePlaygroundImporter matches backstage-lite demo', () => {
    expect(
      isLitePlaygroundImporter(
        '/workspace/packages/playground/src/shared/backstage-lite/index.tsx',
      ),
    ).toBe(true)
  })

  test('rewriteBackstagePeersInSource rewrites core and studio package roots', () => {
    const input = `import {types} from '@unseenco/backstage'
import studio from '@unseenco/backstage/studio'
import type {IStudio} from '@unseenco/backstage/studio/BackstageStudio'`
    const out = rewriteBackstagePeersInSource(input)
    expect(out).toContain(`'@unseenco/backstage/core-lite'`)
    expect(out).toContain(`'@unseenco/backstage/studio-lite'`)
    expect(out).toContain(`'@unseenco/backstage/studio-lite/BackstageStudio'`)
  })

  test('rewriteBackstagePeersInSource is idempotent for already-lite imports', () => {
    const input = `import {types} from '@unseenco/backstage/core-lite'
import {getStudio} from '@unseenco/backstage/studio-lite'`
    const out = rewriteBackstagePeersInSource(input)
    expect(out).not.toContain('core-lite-lite')
    expect(out).not.toContain('studio-lite-lite')
    expect(out).toBe(input)
  })
})
