import gsap from 'gsap'
import React, {useLayoutEffect, useRef, useState} from 'react'
import styled from 'styled-components'
import type {IProject, ISheet} from '@unseenco/theatre-core'
import {registerGsapAnimation} from '@unseenco/theatre-gsap'

const Page = styled.div`
  min-height: 100vh;
  padding: 24px;
  font-family: system-ui, sans-serif;
  background: #0f1115;
  color: #e8eaed;
`

const Hint = styled.p`
  max-width: 42rem;
  line-height: 1.5;
  color: #9aa0a6;
  margin: 0 0 24px;
  code {
    color: #c4c7c5;
  }
`

const Row = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 32px;
`

const Panel = styled.div`
  width: 280px;
  padding: 16px;
  border-radius: 12px;
  background: #1a1d24;
  border: 1px solid #2a2f3a;
  transform-origin: top center;
`

const PanelTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 16px;
`

const Box = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6ee7b7, #3b82f6);
  margin-top: 24px;
`

const Button = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: #3b82f6;
  color: white;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #2563eb;
  }
`

export const GsapTimeModeDemo: React.FC<{
  project: IProject
  sheet: ISheet
}> = ({project, sheet}) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useLayoutEffect(() => {
    void project.ready.then(() => {
      if (!panelRef.current || !boxRef.current) return

      const panelShow = gsap.fromTo(
        panelRef.current,
        {autoAlpha: 0, y: -12, scale: 0.96},
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: 'power2.out',
          paused: true,
        },
      )

      const panelHide = gsap.to(panelRef.current, {
        autoAlpha: 0,
        y: -8,
        scale: 0.98,
        duration: 0.35,
        ease: 'power2.in',
        paused: true,
      })

      const boxMove = gsap.to(boxRef.current, {
        x: 160,
        rotation: 180,
        duration: 1.2,
        ease: 'elastic.out(1, 0.5)',
        paused: true,
      })

      registerGsapAnimation(panelShow, sheet, {
        label: 'Panel show',
        id: 'gsap-panel-show',
      })
      registerGsapAnimation(panelHide, sheet, {
        label: 'Panel hide',
        id: 'gsap-panel-hide',
      })
      registerGsapAnimation(boxMove, sheet, {
        label: 'Box move',
        id: 'gsap-box-move',
      })
    })
  }, [project, sheet])

  useLayoutEffect(() => {
    if (!panelRef.current) return
    if (menuOpen) {
      gsap.set(panelRef.current, {autoAlpha: 1, y: 0, scale: 1})
    } else {
      gsap.set(panelRef.current, {autoAlpha: 0, y: -12, scale: 0.96})
    }
  }, [menuOpen])

  return (
    <Page>
      <Hint>
        GSAP runs the tweens in code; Theatre sequences them on the timeline.
        Open the outline <code>GSAP</code> folder, right-click an animation (or
        click the diamond in the details header) →{' '}
        <strong>Add to sequence at playhead</strong>, then scrub the sequence
        playhead (or play the sheet sequence) to drive{' '}
        <code>animation.progress()</code>.
      </Hint>

      <Row>
        <Button type="button" onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? 'Hide panel (runtime)' : 'Show panel (runtime)'}
        </Button>
      </Row>

      <Panel
        ref={panelRef}
        style={{visibility: menuOpen ? 'visible' : 'hidden'}}
      >
        <PanelTitle>UI panel</PanelTitle>
        <p style={{margin: 0, fontSize: 14, color: '#9aa0a6'}}>
          Toggle with the button for live GSAP, or scrub Theatre clips for Panel
          show / hide.
        </p>
        <Box ref={boxRef} />
      </Panel>
    </Page>
  )
}
