import gsap from 'gsap'
import {
  createRafDriver,
  getProject,
  setCoreRafDriver
} from '@unseenco/backstage'
import studio from '@unseenco/backstage/studio'
import {
  bindGsapTickerToRafDriver,
  configureBackstageGsap
} from '@unseenco/backstage/gsap'
import state from '../backstage/state.json'

const rafDriver = createRafDriver({ name: 'gsap-time-mode' })
setCoreRafDriver(rafDriver)
bindGsapTickerToRafDriver(rafDriver, gsap)

configureBackstageGsap({
  namespace: 'GSAP',
  outlineNamespace: { defaultCollapsed: false },
})

studio.initialize({ __experimental_rafDriver: rafDriver })
studio.ui.hide()

const project = getProject('Backstage Site', { state })
const sheet = project.sheet('Main', { gsap: true })

void project.ready.then(() => {
  console.log('Backstage Site ready')
})
