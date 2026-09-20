import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {
  configureBackstagePageScroll,
  createRafDriver,
  getProject,
  setCoreRafDriver,
  types,
} from '@unseenco/backstage'
import {createLenisScrollDriver} from '@unseenco/backstage/lenis'
import studio from '@unseenco/backstage/studio'
import {
  bindGsapTickerToRafDriver,
  configureBackstageGsap,
  registerAllGsapScrollTriggers,
  registerGsapAnimation,
  registerGsapScrollTrigger,
} from '@unseenco/backstage/gsap'
import {
  hidePageModeDemoForRemoteEditor,
  isRemotePageModeEditorWindow,
} from '../utils/remoteEditorPageModeDemo'

gsap.registerPlugin(ScrollTrigger)

const remoteEditor = isRemotePageModeEditorWindow()
if (remoteEditor) {
  hidePageModeDemoForRemoteEditor()
}

const rafDriver = createRafDriver({name: 'gsap-page-mode-lenis'})
setCoreRafDriver(rafDriver)
bindGsapTickerToRafDriver(rafDriver, gsap)

if (!remoteEditor) {
  configureBackstagePageScroll({
    scroller: typeof document !== 'undefined' ? document.documentElement : null,
  })
}

configureBackstageGsap({
  namespace: 'GSAP',
  outlineNamespace: {defaultCollapsed: false},
  pageScroll: remoteEditor
    ? undefined
    : {
        scroller:
          typeof document !== 'undefined' ? document.documentElement : null,
      },
})

studio.initialize({__experimental_rafDriver: rafDriver})

let lenisDriver: ReturnType<typeof createLenisScrollDriver> | undefined

if (!remoteEditor) {
  const lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
  })

  document.documentElement.classList.add('lenis', 'lenis-smooth')

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value as number, {immediate: true})
      }
      return lenis.scroll
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }
    },
  })

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  lenisDriver = createLenisScrollDriver(lenis)
}

const project = getProject('GSAP page mode Lenis demo')
const sheet = project.sheet('Main', {
  sequenceMode: 'page',
  gsap: true,
  ...(lenisDriver ? {scrollDriver: lenisDriver} : {}),
})

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
