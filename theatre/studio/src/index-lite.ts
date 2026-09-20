/**
 * Entry point for `@unseenco/theatre-studio-lite` (`dist/index-lite.*`).
 * Built with `__THEATRE_LITE__: true` — sequencing UI is disabled at compile time.
 */
// Side-effect import; @unseenco/theatre-core value imports are forbidden in studio.
// eslint-disable-next-line no-relative-imports -- must load core flag from source path
import '../../core/src/theatreLiteRuntimeFlag'
import {setRuntimeStudioMode} from './utils/theatreLiteMode'

setRuntimeStudioMode('lite')

export {default} from './index'
export * from './index'
