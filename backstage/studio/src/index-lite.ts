/**
 * Entry point for `@unseenco/backstage/studio-lite` (`dist/index-lite.*`).
 * Built with `__BACKSTAGE_LITE__: true` — sequencing UI is disabled at compile time.
 */
// Side-effect import; @unseenco/backstage value imports are forbidden in studio.
// eslint-disable-next-line no-relative-imports -- must load core flag from source path
import '../../core/src/backstageLiteRuntimeFlag'
import {setRuntimeStudioMode} from './utils/backstageLiteMode'

setRuntimeStudioMode('lite')

export {default} from './index'
export * from './index'
