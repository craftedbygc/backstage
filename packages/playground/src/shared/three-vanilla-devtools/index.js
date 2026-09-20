import {Clock} from 'three'
import studio from '@unseenco/backstage/studio'
import {
  createRafDriver,
  getProject,
  setCoreRafDriver,
} from '@unseenco/backstage'
import {configureTheatreThreejs} from '@unseenco/backstage/threejs'
import {buildExtension} from '@unseenco/backstage/threejs/extension'
import {bindDockedThreeViewport} from '../utils/bindDockedThreeViewport'
import {createThreeScenes} from './ThreeScene.js'
import state from './three-basic-vanilla-devtools.theatre-project-state.json'

const rafDriver = createRafDriver({name: 'three-basic-vanilla-devtools'})
setCoreRafDriver(rafDriver)

studio.initialize({__experimental_rafDriver: rafDriver})

configureTheatreThreejs({
  autoAddObject: {
    exclude: {
      uniforms: ['uTime'],
    },
  },
})

async function main() {
  // Baseline state for Studio dirty indicators (outline dots, scene flyout).
  // Edit props in Studio, then use "Export project state" to refresh the JSON if needed.
  const project = getProject('Three Basic Vanilla Devtools', {
    assets: {baseUrl: '/public'},
    state,
  })
  await project.ready
  const {renderer, scenes, onFrame} = await createThreeScenes(project)
  const clock = new Clock()

  let activeScene = scenes[0].scene

  const devtools = buildExtension({
    renderer,
    scenes,
    studio,
    onSceneSwitch(_name, scene) {
      activeScene = scene
    },
    onOrbitModeSwitch(enabled) {
      console.log('orbit mode switched', enabled)
    },
  })

  studio.extend(devtools.extension)

  bindDockedThreeViewport({
    canvas: document.getElementById('canvas'),
    renderer,
    cameras: scenes.map(({camera}) => camera),
  })

  function render(time) {
    requestAnimationFrame(render)
    rafDriver.tick(time)
    onFrame?.(clock.getElapsedTime())
    devtools.update()
    renderer.render(activeScene, devtools.getCamera())
  }

  requestAnimationFrame(render)
}

main()
