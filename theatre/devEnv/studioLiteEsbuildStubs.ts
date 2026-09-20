import path from 'path'
import type * as esbuild from 'esbuild'

const SEQUENCE_EDITOR_PANEL_ALLOW = /sequenceEditLimits|whatPropIsHighlighted|graphEditorColors/

export function createStudioLiteEsbuildStubsPlugin(
  studioSrcDir: string,
): esbuild.Plugin {
  const stubDir = path.join(studioSrcDir, 'studio-lite-build')
  const emptyPanelStub = path.join(stubDir, 'emptyReactComponent.liteStub.tsx')

  return {
    name: 'theatre-studio-lite-stubs',
    setup(build) {
      build.onResolve({filter: /sequencePlayback$/}, () => ({
        path: path.join(stubDir, 'sequencePlayback.liteStub.ts'),
      }))

      build.onResolve({filter: /panels\/SequenceEditorPanel\//}, (args) => {
        if (SEQUENCE_EDITOR_PANEL_ALLOW.test(args.path)) {
          return undefined
        }
        if (/sequencePlayback$/.test(args.path)) {
          return undefined
        }
        return {path: emptyPanelStub}
      })

      build.onResolve({filter: /getNearbyKeyframesOfTrack$/}, () => ({
        path: path.join(stubDir, 'getNearbyKeyframesOfTrack.liteStub.tsx'),
      }))

      build.onResolve({filter: /NextPrevKeyframeCursors$/}, () => ({
        path: path.join(stubDir, 'NextPrevKeyframeCursors.liteStub.tsx'),
      }))

      build.onResolve({filter: /GsapClipSequenceIndicator$/}, () => ({
        path: path.join(stubDir, 'GsapClipSequenceIndicator.liteStub.tsx'),
      }))

      build.onResolve({filter: /gsapOutlineMenuItems$/}, () => ({
        path: path.join(stubDir, 'gsapOutlineMenuItems.liteStub.ts'),
      }))

      build.onResolve({filter: /GsapReadOnlyDetailsPanel$/}, () => ({
        path: path.join(stubDir, 'GsapReadOnlyDetailsPanel.liteStub.tsx'),
      }))
    },
  }
}
