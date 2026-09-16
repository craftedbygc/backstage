import React from 'react'
import ReactDOM from 'react-dom/client'
import studio from '@unseenco/theatre-studio'
import {getProject} from '@unseenco/theatre-core'
import {
  attachGsapSequenceBridge,
  configureTheatreGsap,
} from '@unseenco/theatre-gsap'
import {buildExtension} from '@unseenco/theatre-gsap/extension'
import {GsapTimeModeDemo} from './GsapTimeModeDemo'

configureTheatreGsap({
  namespace: 'GSAP',
  outlineNamespace: {defaultCollapsed: false},
})

studio.initialize()

const project = getProject('Theatre × GSAP demo')
const sheet = project.sheet('Main')

attachGsapSequenceBridge(sheet)

const ext = buildExtension({studio})
studio.extend(ext.extension)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GsapTimeModeDemo project={project} sheet={sheet} />,
)
