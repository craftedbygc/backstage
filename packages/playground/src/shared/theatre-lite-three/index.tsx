import {
  createRafDriver,
  getProject,
  setCoreRafDriver,
} from '@unseenco/theatre-core-lite'
import studio from '@unseenco/theatre-studio-lite'
import {autoAddCamera, autoAddObject} from '@unseenco/theatre-threejs?theatre-lite-peers'
import {buildExtension} from '@unseenco/theatre-threejs/extension?theatre-lite-peers'
import {bindDockedThreeViewport} from './bindDockedThreeViewport'
import {
  BoxGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three'
import state from './state.json'

const rafDriver = createRafDriver({name: 'theatre-lite-three'})
setCoreRafDriver(rafDriver)

studio.initialize({
  usePersistentStorage: true,
  __experimental_rafDriver: rafDriver,
})

const project = getProject('Theatre Lite Three', { state })
const sheet = project.sheet('Cube Scene')

const canvas = document.getElementById('canvas') as HTMLCanvasElement

const renderer = new WebGLRenderer({antialias: true, canvas})
renderer.setPixelRatio(window.devicePixelRatio)

const scene = new Scene()
scene.name = 'Cube Scene'
scene.background = new Color(0x1e293b)

const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 0, 10)

const light = new DirectionalLight(0xffffff, 1.2)
light.position.set(4, 6, 3)
scene.add(light)

const mesh = new Mesh(
  new BoxGeometry(1, 1, 1),
  new MeshStandardMaterial({color: 0x3b82f6, metalness: 0.1, roughness: 0.4}),
)
mesh.name = 'Cube'
scene.add(mesh)

autoAddCamera(camera, sheet, {scene})
autoAddObject(mesh, sheet)

const devtools = buildExtension({
  renderer,
  scenes: [{scene, camera}],
  studio,
})

studio.extend(devtools.extension)

bindDockedThreeViewport({canvas, renderer, cameras: camera})

function loop(time: number) {
  requestAnimationFrame(loop)
  rafDriver.tick(time)
  devtools.update()
  renderer.render(scene, devtools.getCamera())
}

void project.ready.then(() => {
  requestAnimationFrame(loop)
})
