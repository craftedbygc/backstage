import {Color} from 'three'
import {rgba2hex} from '@unseenco/backstage-shared/utils/color'
import {applyBackstageRgbaToColor, colorToBackstageRgba} from './colorUtils'

describe('colorUtils', () => {
  test('colorToBackstageRgba matches Three.js hex for saturated colors', () => {
    for (const hex of [0xffffff, 0xff0000, 0x00ff00, 0x0000ff]) {
      const threeColor = new Color(hex)
      const backstageRgba = colorToBackstageRgba(threeColor)
      expect(rgba2hex(backstageRgba, {removeAlphaIfOpaque: true})).toBe(
        `#${threeColor.getHexString()}`,
      )
    }
  })

  test('applyBackstageRgbaToColor round-trips quantized sRGB values', () => {
    const source = new Color(0x808080)
    const rgba = colorToBackstageRgba(source)
    const target = new Color()
    applyBackstageRgbaToColor(target, rgba)
    expect(target.getHexString()).toBe(source.getHexString())
  })
})
