import studio from '@unseenco/backstage/studio'
import {getProject} from '@unseenco/backstage'
import {createThreeScene} from './ThreeScene.js'

studio.initialize()

const project = getProject('Three Basic Vanilla')
createThreeScene(project)
