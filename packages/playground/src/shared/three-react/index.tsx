import React from 'react'
import ReactDOM from 'react-dom/client'
import studio from '@unseenco/backstage/studio'
import {getProject} from '@unseenco/backstage'
import ThreeScene from './ThreeScene'

studio.initialize()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThreeScene project={getProject('Three Basic')} />,
)
