import React, {useCallback, useEffect, useRef, useState} from 'react'
import ReactDOM from 'react-dom/client'
import {getProject, types} from '@unseenco/backstage/core-lite'
import studio from '@unseenco/backstage/studio-lite'

/**
 * Playground demo for `@unseenco/backstage/studio-lite` + `@unseenco/backstage/core-lite`.
 * Static prop authoring, sheet variants, `onValuesChange`, and export JSON.
 */
studio.initialize({usePersistentStorage: false})

const project = getProject('Backstage Lite Playground')
const sheet = project.sheet('Hero')
sheet.declareSequenceVariants(['default', 'compact', 'spacious'])

const MOBILE_BREAKPOINT = 720

const cardConfig = {
  x: types.number(48, {range: [0, 400], label: 'X'}),
  y: types.number(120, {range: [0, 400], label: 'Y'}),
  scale: types.number(1, {range: [0.5, 1.5], label: 'Scale'}),
  background: types.rgba({r: 0.15, g: 0.45, b: 0.95, a: 1}),
  label: types.string('Backstage Lite', {label: 'Label'}),
}

function variantForWidth(width: number): 'compact' | 'spacious' {
  return width < MOBILE_BREAKPOINT ? 'compact' : 'spacious'
}

const panelStyle: React.CSSProperties = {
  maxWidth: 420,
  padding: 16,
  borderRadius: 12,
  background: 'rgba(15, 23, 42, 0.92)',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  marginBottom: 24,
}

const buttonStyle: React.CSSProperties = {
  appearance: 'none',
  border: '1px solid rgba(96, 165, 250, 0.45)',
  background: 'rgba(37, 99, 235, 0.25)',
  color: '#eff6ff',
  borderRadius: 8,
  padding: '10px 12px',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 12,
}

const jsonStyle: React.CSSProperties = {
  margin: '12px 0 0',
  padding: 12,
  borderRadius: 8,
  background: '#020617',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  overflow: 'auto',
  maxHeight: 280,
  fontSize: 12,
  lineHeight: 1.45,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}

const BackstageLiteDemo: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const [liveValues, setLiveValues] = useState<Record<string, unknown> | null>(
    null,
  )
  const [previewVariant, setPreviewVariant] = useState('default')
  const [runtimeVariant, setRuntimeVariant] = useState('default')
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  )
  const [exportedJson, setExportedJson] = useState('')

  useEffect(() => {
    const applyVariantForWidth = (width: number) => {
      const variant = variantForWidth(width)
      sheet.setActiveSequenceVariant(variant)
      setRuntimeVariant(variant)
      setWindowWidth(width)
    }

    applyVariantForWidth(window.innerWidth)
    const onResize = () => applyVariantForWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const obj = sheet.object('Card', cardConfig)

    const unsubscribe = obj.onValuesChange((values, {variant}) => {
      setPreviewVariant(variant)
      setLiveValues(values as Record<string, unknown>)

      const el = cardRef.current
      const labelEl = labelRef.current
      if (!el) return

      el.style.transform = `translate(${values.x}px, ${values.y}px) scale(${values.scale})`
      const {background} = values
      el.style.background = `rgba(${background.r * 255}, ${
        background.g * 255
      }, ${background.b * 255}, ${background.a})`
      if (labelEl) labelEl.textContent = values.label
    })

    return unsubscribe
  }, [])

  const exportProjectJson = useCallback(() => {
    const json = studio.createContentOfSaveFile(project.address.projectId)
    setExportedJson(JSON.stringify(json, null, 2))
  }, [])

  return (
    <div
      style={{
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        padding: 24,
        color: '#e2e8f0',
        background:
          'radial-gradient(circle at top, #1e293b 0%, #0f172a 55%, #020617 100%)',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <div style={panelStyle}>
        <h1 style={{margin: '0 0 8px', fontSize: 22}}>
          Backstage Lite — studio-lite + core-lite
        </h1>
        <p style={{margin: 0, color: '#94a3b8', fontSize: 14, lineHeight: 1.5}}>
          This page imports <strong>studio-lite</strong> and{' '}
          <strong>core-lite</strong> (not full Studio/Core). Use the outline and
          details panels to edit <em>static</em> props — no sequence editor or
          keyframes. Variants <code>compact</code> / <code>spacious</code>{' '}
          follow the window breakpoint; override values per variant in Studio.
          Runtime updates come from <code>onValuesChange</code>; export
          production JSON with the button below (
          <code>createContentOfSaveFile</code>).
        </p>
        <p style={{margin: '12px 0 0', fontSize: 13}}>
          Width: <strong>{windowWidth}px</strong> — Runtime variant:{' '}
          <strong>{runtimeVariant}</strong> — Preview variant:{' '}
          <strong>{previewVariant}</strong>
        </p>
        <button type="button" style={buttonStyle} onClick={exportProjectJson}>
          Export project JSON (studio-lite)
        </button>
        {exportedJson ? <pre style={jsonStyle}>{exportedJson}</pre> : null}
      </div>

      {liveValues ? (
        <pre
          style={{
            ...jsonStyle,
            maxWidth: 420,
            marginBottom: 24,
          }}
        >
          {JSON.stringify(liveValues, null, 2)}
        </pre>
      ) : null}

      <div
        ref={cardRef}
        style={{
          width: 200,
          minHeight: 120,
          padding: 16,
          borderRadius: 16,
          border: '2px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
          transformOrigin: 'top left',
        }}
      >
        <span ref={labelRef} style={{fontWeight: 700, fontSize: 18}} />
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BackstageLiteDemo />,
)
