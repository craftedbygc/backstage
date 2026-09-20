import React from 'react'
import {createRoot} from 'react-dom/client'
import studio from '@unseenco/backstage/studio'
import {getProject} from '@unseenco/backstage'
import {Scene} from './App/Scene'

studio.initialize()

const root = createRoot(document.getElementById('root')!)
root.render(<Scene project={getProject('Sample project')} />)
