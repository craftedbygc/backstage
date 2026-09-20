import {$, cd, path} from '@cspotcode/zx'

const PATH_TO_PACKAGE = path.join(__dirname, `./package`)

describe(`vite-backstage-full-stack`, () => {
  test(`production build succeeds`, async () => {
    cd(PATH_TO_PACKAGE)
    const {exitCode} = await $`npm run build`
    expect(exitCode).toEqual(0)
  })

  test(`vite dependency pre-bundle succeeds`, async () => {
    cd(PATH_TO_PACKAGE)
    const {exitCode} = await $`node scripts/run-vite-optimize.mjs`
    expect(exitCode).toEqual(0)
  })
})
