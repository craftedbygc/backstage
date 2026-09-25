import type {IRafDriver} from '@unseenco/backstage'
const mockPeekBackstageCoreRafDriver = jest.fn()

jest.doMock('@unseenco/backstage/privateAPIs', () => ({
  peekBackstageCoreRafDriver: () => mockPeekBackstageCoreRafDriver(),
}))

import type * as GsapTickerRafBridgeModule from './gsapTickerRafBridge'

type BridgeModule = typeof GsapTickerRafBridgeModule

function loadBridgeModule(): BridgeModule {
  let bridge!: BridgeModule
  jest.isolateModules(() => {
    bridge = require('./gsapTickerRafBridge') as BridgeModule
  })
  return bridge
}

function createMockRafDriver(overrides: Partial<IRafDriver> = {}): IRafDriver {
  return {
    type: 'Backstage_RafDriver_PublicAPI',
    name: 'TestDriver',
    id: 42,
    tick: jest.fn(),
    ...overrides,
  }
}

function createMockGsapTicker() {
  const listeners = new Set<(time: number) => void>()
  return {
    ticker: {
      add: (fn: (time: number) => void) => {
        listeners.add(fn)
      },
      remove: (fn: (time: number) => void) => {
        listeners.delete(fn)
      },
    },
    emit(time: number) {
      listeners.forEach((fn) => fn(time))
    },
  }
}

describe('gsapTickerRafBridge', () => {
  const originalWindow = globalThis.window
  let bridge: BridgeModule

  beforeEach(() => {
    mockPeekBackstageCoreRafDriver.mockReset()
    Object.defineProperty(globalThis, 'window', {
      value: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
      configurable: true,
      writable: true,
    })
    bridge = loadBridgeModule()
  })

  afterEach(() => {
    bridge.resetGsapTickerRafBridgeForTests()
    jest.restoreAllMocks()
    if (originalWindow === undefined) {
      // @ts-expect-error restore node env without window
      delete globalThis.window
    } else {
      globalThis.window = originalWindow
    }
  })

  test('bindGsapTickerToRafDriver ticks rafDriver with seconds → ms', () => {
    const rafDriver = createMockRafDriver()
    const gsap = createMockGsapTicker()

    bridge.bindGsapTickerToRafDriver(rafDriver, gsap)
    gsap.emit(1.5)

    expect(rafDriver.tick).toHaveBeenCalledWith(1500)
    expect(bridge.isRafDriverDrivenByGsapTicker(rafDriver)).toBe(true)
  })

  test('bind cleanup removes ticker listener and mark', () => {
    const rafDriver = createMockRafDriver()
    const gsap = createMockGsapTicker()

    const unbind = bridge.bindGsapTickerToRafDriver(rafDriver, gsap)
    expect(bridge.isRafDriverDrivenByGsapTicker(rafDriver)).toBe(true)

    unbind()
    gsap.emit(2)
    expect(rafDriver.tick).not.toHaveBeenCalled()
    expect(bridge.isRafDriverDrivenByGsapTicker(rafDriver)).toBe(false)
  })

  test('warnIfGsapTickerNotDrivingBackstageRaf warns for DefaultCoreRafDriver', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const publicApi = createMockRafDriver({
      name: 'DefaultCoreRafDriver',
      id: 1,
    })
    mockPeekBackstageCoreRafDriver.mockReturnValue(publicApi)

    bridge.warnIfGsapTickerNotDrivingBackstageRaf()

    expect(warn).toHaveBeenCalledTimes(1)
    bridge.warnIfGsapTickerNotDrivingBackstageRaf()
    expect(warn).toHaveBeenCalledTimes(1)
  })

  test('warnIfGsapTickerNotDrivingBackstageRaf warns when custom driver is not gsap-bound', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const publicApi = createMockRafDriver({name: 'custom', id: 2})
    mockPeekBackstageCoreRafDriver.mockReturnValue(publicApi)

    bridge.warnIfGsapTickerNotDrivingBackstageRaf()
    expect(warn).toHaveBeenCalledTimes(1)
  })

  test('warnIfGsapTickerNotDrivingBackstageRaf is silent when gsap drives custom driver', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const publicApi = createMockRafDriver({name: 'gsap-time-mode', id: 3})
    const gsap = createMockGsapTicker()
    bridge.bindGsapTickerToRafDriver(publicApi, gsap)
    mockPeekBackstageCoreRafDriver.mockReturnValue(publicApi)
    expect(bridge.isRafDriverDrivenByGsapTicker(publicApi)).toBe(true)

    bridge.warnIfGsapTickerNotDrivingBackstageRaf()
    expect(mockPeekBackstageCoreRafDriver).toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled()
  })

  test('suppressGsapTickerRafWarning skips warning', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    mockPeekBackstageCoreRafDriver.mockReturnValue(
      createMockRafDriver({name: 'DefaultCoreRafDriver'}),
    )

    let suppressedBridge!: BridgeModule
    jest.isolateModules(() => {
      const {configureBackstageGsap: configure} = require('./config') as {
        configureBackstageGsap: (config: {
          suppressGsapTickerRafWarning?: boolean
        }) => {reset: () => void}
      }
      configure({suppressGsapTickerRafWarning: true})
      suppressedBridge = require('./gsapTickerRafBridge') as BridgeModule
    })

    suppressedBridge.warnIfGsapTickerNotDrivingBackstageRaf()
    expect(warn).not.toHaveBeenCalled()
  })

  test('scheduleGsapTickerRafWarningCheck defers until after bind in same turn', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const publicApi = createMockRafDriver({name: 'gsap-time-mode', id: 4})
    const gsap = createMockGsapTicker()
    mockPeekBackstageCoreRafDriver.mockReturnValue(publicApi)

    bridge.scheduleGsapTickerRafWarningCheck()
    bridge.bindGsapTickerToRafDriver(publicApi, gsap)

    await Promise.resolve()
    expect(warn).not.toHaveBeenCalled()
  })

  test('scheduleGsapTickerRafWarningCheck warns when bind is missing', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    mockPeekBackstageCoreRafDriver.mockReturnValue(
      createMockRafDriver({name: 'DefaultCoreRafDriver', id: 5}),
    )

    bridge.scheduleGsapTickerRafWarningCheck()
    await Promise.resolve()
    expect(warn).toHaveBeenCalledTimes(1)
  })
})
