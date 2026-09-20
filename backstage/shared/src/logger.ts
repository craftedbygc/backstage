export type {
  ILogger,
  IUtilLogger,
  IBackstageConsoleLogger,
  IBackstageLogIncludes,
  IBackstageLogSource,
  IBackstageLoggerConfig,
  IBackstageLoggingConfig,
  IBackstageInternalLogger,
} from './_logger/logger'
import {createBackstageInternalLogger, BackstageLoggerLevel} from './_logger/logger'
import type {IUtilLogger} from './_logger/logger'
export {BackstageLoggerLevel, createBackstageInternalLogger} from './_logger/logger'

/**
 * Common object interface for the context to pass in to utility functions.
 *
 * Prefer to pass this into utility function rather than an {@link IUtilLogger}.
 */
export interface IUtilContext {
  readonly logger: IUtilLogger
}

const internal = createBackstageInternalLogger(console, {
  _debug: function () {},
  _error: function () {},
})

internal.configureLogging({
  dev: true,
  min: BackstageLoggerLevel.TRACE,
})

export default internal
  .getLogger()
  .named('Backstage.js (default logger)')
  .utilFor.dev()
