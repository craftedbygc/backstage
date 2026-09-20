import {Color} from 'three'

type BackstageRgba = {r: number; g: number; b: number; a: number}

const tempColor = new Color()

/** Match 8-bit sRGB channels so Backstage's rgba hex display (truncates) stays accurate. */
function quantizeSrgbChannel(value: number): number {
  return Math.round(value * 255) / 255
}

export function colorToBackstageRgba(color: Color): BackstageRgba {
  tempColor.copy(color).convertLinearToSRGB()
  return {
    r: quantizeSrgbChannel(tempColor.r),
    g: quantizeSrgbChannel(tempColor.g),
    b: quantizeSrgbChannel(tempColor.b),
    a: 1,
  }
}

export function applyBackstageRgbaToColor(color: Color, rgba: BackstageRgba): void {
  tempColor.setRGB(rgba.r, rgba.g, rgba.b).convertSRGBToLinear()
  color.copy(tempColor)
}
