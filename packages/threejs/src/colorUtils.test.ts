import {Color} from 'three'
import {rgba2hex} from '@unseenco/theatre-shared/utils/color'
import {applyTheatreRgbaToColor, colorToTheatreRgba} from './colorUtils'

describe('colorUtils', () => {
  test('colorToTheatreRgba matches Three.js hex for saturated colors', () => {
    for (const hex of [0xffffff, 0xff0000, 0x00ff00, 0x0000ff]) {
      const threeColor = new Color(hex)
      const theatreRgba = colorToTheatreRgba(threeColor)
      expect(rgba2hex(theatreRgba, {removeAlphaIfOpaque: true})).toBe(
        `#${threeColor.getHexString()}`,
      )
    }
  })

  test('applyTheatreRgbaToColor round-trips quantized sRGB values', () => {
    const source = new Color(0x808080)
    const rgba = colorToTheatreRgba(source)
    const target = new Color()
    applyTheatreRgbaToColor(target, rgba)
    expect(target.getHexString()).toBe(source.getHexString())
  })
})
