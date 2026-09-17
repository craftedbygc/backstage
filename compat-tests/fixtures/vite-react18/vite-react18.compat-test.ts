import {$, cd, path} from '@cspotcode/zx'

const PATH_TO_PACKAGE = path.join(__dirname, `./package`)

describe(`vite-react18`, () => {
  test(`build succeeds`, async () => {
    cd(PATH_TO_PACKAGE)
    const {exitCode} = await $`npm run build`
    expect(exitCode).toEqual(0)
  })
})
