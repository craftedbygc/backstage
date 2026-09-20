import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {
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

const rafDriver = createRafDriver({name: 'gsap-page-mode'})
setCoreRafDriver(rafDriver)
bindGsapTickerToRafDriver(rafDriver, gsap)

configureTheatreGsap({
  namespace: 'GSAP',
  outlineNamespace: {defaultCollapsed: false},
})

studio.initialize({__experimental_rafDriver: rafDriver})

const project = getProject('GSAP page mode demo')
const sheet = project.sheet('Main', {sequenceMode: 'page', gsap: true})

const heroBox = document.getElementById('hero-box')!
const midPanel = document.getElementById('mid-panel')!
const stSection = document.getElementById('st-section')!
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
    rotate: 360,
    scale: 1.25,
    duration: 1,
    paused: true,
  })

  registerGsapAnimation(boxMove, sheet, {
    label: 'Hero / Move',
    defaultDuration: 25,
  })

  const panelReveal = gsap.to([midPanel, heroBox], {
    autoAlpha: 1,
    y: 0,
    duration: 1,
    paused: true,
  })

  registerGsapAnimation(panelReveal, sheet, {
    label: 'Mid / Panel reveal',
  })

  // ScrollTrigger.create({ animation }) style
  const stTween = gsap.to(stTarget, {
    rotation: 360,
    scale: 1.2,
    duration: 1,
    paused: true,
  })

  const stCreate = ScrollTrigger.create({
    trigger: stSection,
    start: 'top center',
    end: 'bottom center',
    scrub: true,
    animation: stTween,
    id: 'st-create-demo',
  })

  registerGsapScrollTrigger(stCreate, sheet, {
    label: 'Create API scrub example',
  })

  // vars.scrollTrigger on timeline style
  const stTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: stSection,
      start: 'center center',
      end: '+=600',
      scrub: true,
      id: 'st-vars-demo',
    },
    paused: true,
  })
  stTimeline
    .to(stTarget, {x: 80, duration: 0.5, ease: 'none', id: 'move right'})
    .to(stTarget, {x: -40, duration: 0.5, ease: 'none', id: 'move left'})

  registerAllGsapScrollTriggers(sheet)
})
