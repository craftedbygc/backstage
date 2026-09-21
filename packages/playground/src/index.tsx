import {PlaygroundPage} from './home/PlaygroundPage'
import ReactDom from 'react-dom/client'
import React from 'react'

ReactDom.createRoot(document.getElementById('root')!).render(
  <PlaygroundPage groups={__PLAYGROUND_DEMO_GROUPS__} />,
)
