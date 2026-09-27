import { fromEuroText, toEuroText } from './euros'

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
