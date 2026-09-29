/** An sRGB colour, each channel from 0 to 1. */
export type Rgb = readonly [red: number, green: number, blue: number]

/** `#rrggbb` → channels. */
export function hexToRgb(hex: string): Rgb {
  const channel = (start: number) => Number.parseInt(hex.slice(start, start + 2), 16) / 255
  return [channel(1), channel(3), channel(5)]
}

/** `top` painted over `base` at `alpha`, the way the browser composites a layer (sRGB). */
export function mix(base: Rgb, top: Rgb, alpha: number): Rgb {
  const [r, g, b] = base
  return [r + (top[0] - r) * alpha, g + (top[1] - g) * alpha, b + (top[2] - b) * alpha]
}

const linear = (channel: number) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4

/** WCAG 2 relative luminance, from 0 (black) to 1 (white). */
export const relativeLuminance = ([r, g, b]: Rgb) =>
  0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)

/** WCAG 2 contrast ratio between two colours, from 1 to 21, in either order. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const [la, lb] = [relativeLuminance(a), relativeLuminance(b)]
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}
