import React from 'react'
import ReactDOM from 'react-dom/client'
import studio from '@unseenco/backstage/studio'
import {getProject} from '@unseenco/backstage'
import {Scene} from './Scene'

/**
 * Demonstrates `sheet.declareOutlineNamespace()` and
 * `sheet.setOutlineNamespaceCollapsed()` from `@unseenco/backstage`.
 */

const project = getProject('Outline folders demo')
const sheet = project.sheet('Scene')

sheet.declareOutlineNamespace('Props', {collapsed: true})
sheet.declareOutlineNamespace('Empty Folder', {collapsed: true})

studio.initialize()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Scene project={project} />,
)
