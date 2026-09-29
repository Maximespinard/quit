import { contrastRatio, hexToRgb, mix } from './color'

it('reads a hex colour as channels from 0 to 1', () => {
  expect(hexToRgb('#ff8000')).toEqual([1, 128 / 255, 0])
})

it('measures contrast as WCAG does', () => {
  expect(contrastRatio(hexToRgb('#ffffff'), hexToRgb('#000000'))).toBeCloseTo(21)
  expect(contrastRatio(hexToRgb('#777777'), hexToRgb('#ffffff'))).toBeCloseTo(4.48, 2)
  expect(contrastRatio(hexToRgb('#101012'), hexToRgb('#f7f4ef'))).toBeCloseTo(
    contrastRatio(hexToRgb('#f7f4ef'), hexToRgb('#101012')),
  )
})

it('paints one colour over another at an opacity', () => {
  const black = hexToRgb('#000000')
  const white = hexToRgb('#ffffff')

  expect(mix(black, white, 0)).toEqual(black)
  expect(mix(black, white, 1)).toEqual(white)
  expect(mix(black, white, 0.25)).toEqual([0.25, 0.25, 0.25])
})
