describe('setCoreRafDriver after GSAP warning scheduling', () => {
  test('does not throw when warning check runs before setCoreRafDriver', async () => {
    jest.isolateModules(() => {
      const backstage = require('@unseenco/backstage')
      const bridge = require('./gsapTickerRafBridge')

      bridge.scheduleGsapTickerRafWarningCheck()
      const driver = backstage.createRafDriver({name: 'gsap-time-mode'})
      expect(() => backstage.setCoreRafDriver(driver)).not.toThrow()
    })
    await Promise.resolve()
  })
})
