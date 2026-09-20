import getStudio from '@unseenco/backstage/studio/getStudio'
import {isRemoteEditorWindow} from '@unseenco/backstage/studio/remoteEditor'
import {usePrism, useVal} from '@unseenco/backstage/react'
import {val} from '@unseenco/backstage/dataverse'
import React, {useEffect} from 'react'
import styled, {createGlobalStyle} from 'styled-components'
import PanelsRoot from './PanelsRoot'
import DockedPanelsRoot from './DockedPanelsRoot'
import GlobalToolbar from '@unseenco/backstage/studio/toolbars/GlobalToolbar'
import {LayoutModeProvider} from './LayoutModeContext'
import useRefAndState from '@unseenco/backstage/studio/utils/useRefAndState'
import {PortalContext} from 'reakit'
import type {$IntentionalAny} from '@unseenco/backstage-shared/utils/types'
import useKeyboardShortcuts from './useKeyboardShortcuts'
import PointerEventsHandler from '@unseenco/backstage/studio/uiComponents/PointerEventsHandler'
import {MountAll} from '@unseenco/backstage/studio/utils/renderInPortalInContext'
import {PortalLayer, ProvideStyles} from '@unseenco/backstage/studio/css'
import {
  createBackstageInternalLogger,
  BackstageLoggerLevel,
} from '@unseenco/backstage-shared/logger'
import {ProvideLogger} from '@unseenco/backstage/studio/uiComponents/useLogger'
import {Notifier} from '@unseenco/backstage/studio/notify'
import {useChordialCaptureEvents} from '@unseenco/backstage/studio/uiComponents/chordial/useChodrial'
import {DomElementHighlightProvider} from '@unseenco/backstage/studio/gsap/DomElementHighlightOverlay'
import {ChordialOverlay} from '@unseenco/backstage/studio/uiComponents/chordial/ChordialOverlay'

const MakeRootHostContainStatic =
  typeof window !== 'undefined'
    ? createGlobalStyle`
  :host {
    contain: strict;
  }
`
    : ({} as ReturnType<typeof createGlobalStyle>)

const Container = styled(PointerEventsHandler)`
  z-index: 50;
  position: fixed;
  inset: 0;

  &.invisible {
    pointer-events: none !important;
    opacity: 0;
    transform: translateX(1000000px);
  }
`

const INTERNAL_LOGGING = /Playground.+Backstage\.js/.test(
  (typeof document !== 'undefined' ? document?.title : null) ?? '',
)

export default function UIRoot(props: {
  containerShadow: ShadowRoot & HTMLElement
}) {
  const studio = getStudio()
  const [portalLayerRef, portalLayer] = useRefAndState<HTMLDivElement>(
    undefined as $IntentionalAny,
  )

  const uiRootLogger = createBackstageInternalLogger()
  uiRootLogger.configureLogging({
    min: BackstageLoggerLevel.DEBUG,
    dev: INTERNAL_LOGGING,
    internal: INTERNAL_LOGGING,
  })
  const logger = uiRootLogger.getLogger().named('Backstage.js UIRoot')

  useKeyboardShortcuts()

  const visiblityState = useVal(studio.atomP.ahistoric.visibilityState)
  useEffect(() => {
    if (!isRemoteEditorWindow() && visiblityState === 'everythingIsHidden') {
      console.warn(
        `Backstage.js Studio is hidden. Use the keyboard shortcut 'alt + \\' to restore the studio, or call studio.ui.restore().`,
      )
    }
    return () => {}
  }, [visiblityState])

  const chordialRootRef = useChordialCaptureEvents()

  const inside = usePrism(() => {
    const visiblityState = val(studio.atomP.ahistoric.visibilityState)
    const isStudioHidden =
      !isRemoteEditorWindow() && visiblityState === 'everythingIsHidden'

    const initialised = val(studio.atomP.ephemeral.initialised)
    const dockedMode = val(studio.atomP.historic.dockedMode) ?? false

    return !initialised ? null : (
      <ProvideLogger logger={logger}>
        <MountExtensionComponents />
        <PortalContext.Provider value={portalLayer}>
          <ProvideStyles
            target={
              window.__IS_VISUAL_REGRESSION_TESTING === true
                ? undefined
                : props.containerShadow
            }
          >
            <>
              <MakeRootHostContainStatic />
              <DomElementHighlightProvider>
                <Container
                  className={isStudioHidden ? 'invisible' : ''}
                  // @ts-ignore
                  ref={chordialRootRef}
                >
                  <PortalLayer ref={portalLayerRef} />
                  <ChordialOverlay />
                  <LayoutModeProvider>
                    {dockedMode ? (
                      <DockedPanelsRoot />
                    ) : (
                      <>
                        <GlobalToolbar />
                        <PanelsRoot />
                      </>
                    )}
                    <Notifier />
                  </LayoutModeProvider>
                </Container>
              </DomElementHighlightProvider>
            </>
          </ProvideStyles>
        </PortalContext.Provider>
      </ProvideLogger>
    )
  }, [studio, portalLayerRef, portalLayer])

  return inside
}

const MountExtensionComponents: React.FC<{}> = () => {
  return <MountAll />
}
