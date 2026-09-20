import gsap from 'gsap'
import studio from '@unseenco/backstage/studio'
import {
  createRafDriver,
  getProject,
  setCoreRafDriver,
} from '@unseenco/backstage'
import {
  attachGsapSequenceBridge,
  configureBackstageGsap,
} from '@unseenco/backstage/gsap'
import {configureBackstageThreejs} from '@unseenco/backstage/threejs'
import {buildExtension} from '@unseenco/backstage/threejs/extension'

const rafDriver = createRafDriver({name: 'compat-full-stack'})
setCoreRafDriver(rafDriver)

configureBackstageGsap({namespace: 'GSAP'})
configureBackstageThreejs()

studio.initialize({__experimental_rafDriver: rafDriver})

const project = getProject('Compat Full Stack')
const sheet = project.sheet('Main')
attachGsapSequenceBridge(sheet)

// Resolves published extension bundle + studio package exports (subpath shims).
if (typeof buildExtension !== 'function') {
  throw new Error(
    'Expected buildExtension from @unseenco/backstage/threejs/extension',
  )
}

gsap.to({value: 0}, {value: 1, duration: 0.001, overwrite: true})
