import {test, expect} from '@playwright/test'

test.describe('three-basic-vanilla-devtools', () => {
  test('loads WebGL canvas', async ({page}) => {
    test.setTimeout(30_000)
    await page.goto('./shared/three-basic-vanilla-devtools/')
    await expect(page.locator('canvas').first()).toBeVisible({timeout: 20000})
  })
})
