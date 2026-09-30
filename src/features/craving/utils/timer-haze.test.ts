import { themeTokens } from '@/shared/test/theme-tokens'
import { contrastRatio, hexToRgb, type Rgb } from './color'
import { brightestHazePixel, type HazeTone, TIMER_HAZE } from './timer-haze'

const colour = (token: string): Rgb => {
  const value = themeTokens('color').get(token)
  if (value === undefined) throw new Error(`No colour token "${token}"`)
  return hexToRgb(value)
}

const palette: Record<HazeTone, Rgb> = {
  bronze: colour('bronze'),
  moss: colour('moss'),
  page: colour('page'),
}

// Blobs drift and overlap anywhere, so the check takes the brightest pixel any frame can paint.
it('keeps the countdown at 4.5:1 or more over every frame of the haze', () => {
  const brightest = brightestHazePixel(palette, TIMER_HAZE)

  expect(contrastRatio(colour('white'), brightest)).toBeGreaterThanOrEqual(4.5)
})

it('keeps the cream text and the stop button at 4.5:1 too', () => {
  expect(
    contrastRatio(colour('ink'), brightestHazePixel(palette, TIMER_HAZE)),
  ).toBeGreaterThanOrEqual(4.5)
})

it('would catch a haze turned up too bright', () => {
  const unguarded = { ...TIMER_HAZE, opacity: 1 }

  expect(contrastRatio(colour('white'), brightestHazePixel(palette, unguarded))).toBeLessThan(4.5)
})

it('never paints below the bare page', () => {
  const none = { ...TIMER_HAZE, opacity: 0, grainOpacity: 0 }

  expect(brightestHazePixel(palette, none)).toEqual(palette.page)
})
