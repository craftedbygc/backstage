import {writeFileSync} from 'fs'
import path from 'path'

const backstageDir = path.join(__dirname, '..')
const version = require('../package.json').version

for (const which of ['core', 'studio']) {
  const original = require('../' + which + '/package.json')
  if (original.version !== version) {
    console.log(`Setting version of @unseenco/backstage-${which} to ${version}`)

    const newJson = {...original}
    newJson.version = version
    writeFileSync(
      path.join(backstageDir, `./${which}/package.json`),
      JSON.stringify(newJson, undefined, 2),
    )
  }
}
