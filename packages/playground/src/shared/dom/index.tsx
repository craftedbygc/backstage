import React from 'react'
import ReactDOM from 'react-dom/client'
import studio from '@unseenco/backstage/studio'
import {getProject} from '@unseenco/backstage'
import {Scene} from './Scene'
import state from './dom.backstage-project-state.json'

/**
 * This is a basic example of using Backstage.js for manipulating the DOM.
 *
 * It also uses {@link IStudio.selection | studio.selection} to customize
 * the selection behavior.
 *
 * Saved state is loaded from `dom.backstage-project-state.json` so Studio can
 * compare live edits against the on-disk baseline (outer diamond indicator),
 * even after refresh when state is restored from localStorage.
 */

studio.initialize()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Scene project={getProject('Sample project', {state})} />,
)
