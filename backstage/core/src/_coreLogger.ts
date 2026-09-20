import type {
  IBackstageLoggerConfig,
  IBackstageLoggingConfig,
} from '@unseenco/backstage-shared/logger'
import {BackstageLoggerLevel} from '@unseenco/backstage-shared/logger'
import {createBackstageInternalLogger} from '@unseenco/backstage-shared/logger'

export type CoreLoggingConfig = Partial<{
  logger: IBackstageLoggerConfig
  logging: IBackstageLoggingConfig
}>

function noop() {}

export function _coreLogger(config?: CoreLoggingConfig) {
  const internalMin = config?.logging?.internal
    ? config.logging.min ?? BackstageLoggerLevel.WARN
    : Infinity // if not internal, then don't show any logs
  const shouldDebugLogger = internalMin <= BackstageLoggerLevel.DEBUG
  const shouldShowLoggerErrors = internalMin <= BackstageLoggerLevel.ERROR
  const internal = createBackstageInternalLogger(undefined, {
    _debug: shouldDebugLogger
      ? console.debug.bind(console, '_coreLogger(BackstageInternalLogger) debug')
      : noop,
    _error: shouldShowLoggerErrors
      ? console.error.bind(console, '_coreLogger(BackstageInternalLogger) error')
      : noop,
  })

  if (config) {
    const {logger, logging} = config
    if (logger) internal.configureLogger(logger)
    if (logging) internal.configureLogging(logging)
    else {
      // default to showing Backstage.js dev logs in non-production environments
      internal.configureLogging({
        dev: process.env.NODE_ENV !== 'production',
      })
    }
  }

  return internal.getLogger().named('Backstage')
}
