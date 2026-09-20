import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {
  configureTheatrePageScroll,
  createDefaultPageScrollDriver,
  createRafDriver,
  getProject,
  setCoreRafDriver,
  types,
} from '@unseenco/theatre-core'
import studio from '@unseenco/theatre-studio'
import {
  bindGsapTickerToRafDriver,
  configureTheatreGsap,
  registerAllGsapScrollTriggers,
  registerGsapAnimation,
  registerGsapScrollTrigger,
} from '@unseenco/theatre-gsap'

gsap.registerPlugin(ScrollTrigger)

const rafDriver = createRafDriver({name: 'gsap-page-mode-horizontal'})
setCoreRafDriver(rafDriver)
bindGsapTickerToRafDriver(rafDriver, gsap)

configureTheatrePageScroll({axis: 'horizontal'})
configureTheatreGsap({
  namespace: 'GSAP',
  outlineNamespace: {defaultCollapsed: false},
  pageScroll: {axis: 'horizontal'},
})

studio.initialize({__experimental_rafDriver: rafDriver})

const project = getProject('GSAP horizontal page mode demo')
const sheet = project.sheet('Main', {
  sequenceMode: 'page',
  gsap: true,
  scrollDriver: createDefaultPageScrollDriver(),
})

const heroBox = document.getElementById('hero-box')!
const stPanelA = document.getElementById('st-panel-a')!
const stTarget = document.getElementById('st-target')!

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
    rotate: 180,
    scale: 1.2,
    duration: 1,
    paused: true,
  })

  registerGsapAnimation(boxMove, sheet, {
    label: 'Hero / Move',
    defaultDuration: 30,
  })

  const stTween = gsap.to(stTarget, {
    rotation: 360,
    x: 120,
    duration: 1,
    paused: true,
  })

  const stCreate = ScrollTrigger.create({
    horizontal: true,
    trigger: stPanelA,
    start: 'left center',
    end: 'right center',
    scrub: true,
    animation: stTween,
    id: 'st-horizontal-create',
  })

  registerGsapScrollTrigger(stCreate, sheet, {
    label: 'Horizontal create API',
  })

  const stTimeline = gsap.timeline({
    scrollTrigger: {
      horizontal: true,
      trigger: stPanelA,
      start: 'center center',
      end: '+=800',
      scrub: true,
      id: 'st-horizontal-vars',
    },
    paused: true,
  })
  stTimeline
    .to(stTarget, {y: 40, duration: 0.5, ease: 'none', id: 'dip'})
    .to(stTarget, {y: -20, duration: 0.5, ease: 'none', id: 'rise'})

  registerAllGsapScrollTriggers(sheet)
})
