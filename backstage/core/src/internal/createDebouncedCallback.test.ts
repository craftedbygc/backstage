import {createDebouncedCallback} from './createDebouncedCallback'

describe('createDebouncedCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('runs once after delay when scheduled repeatedly', () => {
    const fn = jest.fn()
    const debounced = createDebouncedCallback(fn, 300)

    debounced.schedule()
    debounced.schedule()
    debounced.schedule()

    expect(fn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(299)
    expect(fn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('flush runs pending callback immediately', () => {
    const fn = jest.fn()
    const debounced = createDebouncedCallback(fn, 300)

    debounced.schedule()
    debounced.flush()

    expect(fn).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('flush is a no-op when nothing is pending', () => {
    const fn = jest.fn()
    const debounced = createDebouncedCallback(fn, 300)

    debounced.flush()
    expect(fn).not.toHaveBeenCalled()
  })

  it('cancel prevents a scheduled run', () => {
    const fn = jest.fn()
    const debounced = createDebouncedCallback(fn, 300)

    debounced.schedule()
    debounced.cancel()

    jest.advanceTimersByTime(300)
    expect(fn).not.toHaveBeenCalled()
  })
})
