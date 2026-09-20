import React from 'react'
import ReactDOM from 'react-dom/client'
import studio from '@unseenco/backstage/studio'
import {getProject} from '@unseenco/backstage'
import {Scene} from './Scene'

studio.initialize()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Scene project={getProject('Sample project')} />,
)
