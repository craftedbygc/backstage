import gsap from 'gsap'
import {
  createRafDriver,
  getProject,
  onChange,
  setCoreRafDriver,
  types,
} from '@unseenco/theatre-core'
import studio from '@unseenco/theatre-studio'
import {
  attachGsapSequenceBridge,
  configureTheatreGsap,
  registerGsapAnimation,
} from '@unseenco/theatre-gsap'
import {buildExtension} from '@unseenco/theatre-gsap/extension'

const rafDriver = createRafDriver({name: 'gsap-time-mode'})
setCoreRafDriver(rafDriver)

configureTheatreGsap({
  namespace: 'GSAP',
  outlineNamespace: {defaultCollapsed: false},
})

studio.initialize({__experimental_rafDriver: rafDriver})

const project = getProject('Theatre × GSAP demo')
const sheet = project.sheet('Main')

attachGsapSequenceBridge(sheet)
studio.extend(buildExtension({studio}).extension)

const panel = document.getElementById('panel')!
const box = document.getElementById('box')!
const theatreObjectEl = document.getElementById('theatre-object')!
const toggle = document.getElementById('toggle')!

const panelHidden = {autoAlpha: 0, y: -12, scale: 0.96}
const panelShown = {autoAlpha: 1, y: 0, scale: 1}

let menuOpen = false

function syncPanelRuntimeState() {
  if (menuOpen) {
    gsap.set(panel, panelShown)
    panel.style.visibility = 'visible'
    toggle.textContent = 'Hide panel (runtime)'
  } else {
    gsap.set(panel, panelHidden)
    panel.style.visibility = 'hidden'
    toggle.textContent = 'Show panel (runtime)'
  }
}

toggle.addEventListener('click', () => {
  menuOpen = !menuOpen
  syncPanelRuntimeState()
})

// GSAP ticker is the master clock; Theatre core + Studio share this rAF driver.
gsap.ticker.add((time) => {
  rafDriver.tick(time * 1000)
})

void project.ready.then(() => {
  const panelShow = gsap.fromTo(panel, panelHidden, {
    ...panelShown,
    duration: 0.45,
    ease: 'power2.out',
    paused: true,
  })

  const panelHide = gsap.fromTo(panel, panelShown, {
    autoAlpha: 0,
    y: -8,
    scale: 0.98,
    duration: 0.35,
    ease: 'power2.in',
    paused: true,
  })

  const boxMove = gsap.to(box, {
    x: 160,
    rotation: 180,
    duration: 1.2,
    ease: 'elastic.out(1, 0.5)',
    paused: true,
  })

  registerGsapAnimation(panelShow, sheet, {label: 'UI / Panel show'})
  registerGsapAnimation(panelHide, sheet, {label: 'UI / Panel hide'})
  registerGsapAnimation(boxMove, sheet, {label: 'UI / Box move'})

  let boxChoreoTimeline = gsap.timeline({paused: true})
  boxChoreoTimeline
    .to(box, {x: 80, duration: 0.6, ease: 'power2.out'})
    .to(box, {rotation: 90, duration: 0.5, ease: 'power2.inOut'}, '+=0.1')

  registerGsapAnimation(boxChoreoTimeline, sheet, {
    label: 'Box timeline',
    onRebuildTimeline: () => {
      boxChoreoTimeline = gsap.timeline({paused: true})
      boxChoreoTimeline
        .to(box, {x: 80, duration: 0.6, ease: 'power2.out'})
        .to(box, {rotation: 90, duration: 0.5, ease: 'power2.inOut'}, '+=0.1')
      return boxChoreoTimeline
    },
  })

  const regularObject = sheet.object('Regular Theatre Object', {
    x: types.number(0, {range: [-80, 80], label: 'X'}),
    y: types.number(0, {range: [-80, 80], label: 'Y'}),
    opacity: types.number(1, {range: [0, 1], label: 'Opacity'}),
  })

  onChange(regularObject.props, (values) => {
    theatreObjectEl.style.transform = `translate(${values.x}px, ${values.y}px)`
    theatreObjectEl.style.opacity = String(values.opacity)
  })

  syncPanelRuntimeState()
})
