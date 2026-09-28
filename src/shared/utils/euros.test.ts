import { formatEuros, fromEuroText, toEuroText } from './euros'

describe('fromEuroText', () => {
  it.each([
    ['35', 3_500],
    ['35,5', 3_550],
    ['35,50', 3_550],
    ['35.05', 3_505],
    [' 42 € ', 4_200],
    ['1 250,00', 125_000],
    ['-12', -1_200],
    ['0,99', 99],
  ])('reads %j as %i cents', (text, cents) => {
    expect(fromEuroText(text)).toBe(cents)
  })

  it.each(['', 'abc', '12,345', '1,2,3', '12e3', ','])('cannot read %j', (text) => {
    expect(fromEuroText(text)).toBeNull()
  })
})

describe('toEuroText', () => {
  it('writes cents back into a text field', () => {
    expect(toEuroText(3_550)).toBe('35,50')
    expect(toEuroText(4_200)).toBe('42')
  })
})

describe('formatEuros', () => {
  // French grouping and the space before the sign are narrow no-break spaces.
  it.each([
    [22_008, '220,08\u00a0€'],
    [40_000, '400\u00a0€'],
    [125_005, '1\u202f250,05\u00a0€'],
    [7, '0,07\u00a0€'],
  ])('shows %i cents as %j', (cents, text) => {
    expect(formatEuros(cents)).toBe(text)
  })
})
