import gsap from 'gsap'
import studio from '@unseenco/theatre-studio'
import {
  createRafDriver,
  getProject,
  setCoreRafDriver,
} from '@unseenco/theatre-core'
import {
  attachGsapSequenceBridge,
  configureTheatreGsap,
} from '@unseenco/theatre-gsap'
import {configureTheatreThreejs} from '@unseenco/theatre-threejs'
import {buildExtension} from '@unseenco/theatre-threejs/extension'

const rafDriver = createRafDriver({name: 'compat-full-stack'})
setCoreRafDriver(rafDriver)

configureTheatreGsap({namespace: 'GSAP'})
configureTheatreThreejs()

studio.initialize({__experimental_rafDriver: rafDriver})

const project = getProject('Compat Full Stack')
const sheet = project.sheet('Main')
attachGsapSequenceBridge(sheet)

// Resolves published extension bundle + studio package exports (subpath shims).
if (typeof buildExtension !== 'function') {
  throw new Error(
    'Expected buildExtension from @unseenco/theatre-threejs/extension',
  )
}

gsap.to({value: 0}, {value: 1, duration: 0.001, overwrite: true})
