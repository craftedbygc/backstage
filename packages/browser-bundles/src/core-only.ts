import * as core from '@unseenco/backstage'

// @ts-ignore
window.Backstage = {
  core,
  get studio() {
    alert(
      "Backstage.studio is only available in the core-and-studio.js bundle. You're using the core-only.min.js bundle.",
    )
    return undefined
  },
}
