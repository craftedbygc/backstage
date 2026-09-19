import gsap from 'gsap'
import {
  attachGsapSequenceBridge,
  attachSheetScrollDriver,
  getProject,
  types,
} from '@unseenco/theatre-core'
import studio from '@unseenco/theatre-studio'
import {
  configureTheatreGsap,
  registerGsapAnimation,
} from '@unseenco/theatre-gsap'

configureTheatreGsap({
  namespace: 'GSAP',
  outlineNamespace: {defaultCollapsed: false},
})

studio.initialize()

const project = getProject('GSAP page mode demo')
const sheet = project.sheet('Main')

sheet.setSequenceMode('page')
attachSheetScrollDriver(sheet)
attachGsapSequenceBridge(sheet)

const heroBox = document.getElementById('hero-box')!
const midPanel = document.getElementById('mid-panel')!

void project.ready.then(() => {
  sheet.object(
    'Hero box',
    {
      x: types.number(0, {range: [-200, 200]}),
      y: types.number(0, {range: [-200, 200]}),
      scale: types.number(1, {range: [0.2, 2], nudgeMultiplier: 0.01}),
    },
    {reconfigure: true},
  )

  const boxMove = gsap.to(heroBox, {
    x: 160,
    y: -80,
    scale: 1.25,
    duration: 1,
    paused: true,
  })

  registerGsapAnimation(boxMove, sheet, {
    label: 'Hero / Move',
    defaultDuration: 25,
  })

  const panelReveal = gsap.to(midPanel, {
    autoAlpha: 1,
    y: 0,
    duration: 1,
    paused: true,
  })

  registerGsapAnimation(panelReveal, sheet, {
    label: 'Mid / Panel reveal',
    defaultDuration: 20,
  })
})
