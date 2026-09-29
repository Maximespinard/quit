import { themeTokens } from '@/shared/test/theme-tokens'
import { COLOR_TOKENS, RADIUS_TOKENS, TYPE_TOKENS } from './specimen-data'

/** Utility names only: they paint nothing a swatch could show. */
const NOT_SWATCHES = new Set(['transparent', 'current-color'])

it('shows every colour token of the theme, with its value', () => {
  const theme = [...themeTokens('color')]
    .filter(([name]) => !NOT_SWATCHES.has(name))
    .map(([name, value]) => ({ token: name, swatch: `bg-${name}`, value }))

  expect(COLOR_TOKENS.map(({ token, swatch, value }) => ({ token, swatch, value }))).toEqual(theme)
})

it('shows every type token of the theme', () => {
  expect(TYPE_TOKENS.map(({ token }) => token)).toEqual([...themeTokens('text').keys()])
})

it('shows every radius token of the theme, with its value', () => {
  expect(RADIUS_TOKENS.map(({ token, value }) => [token, value])).toEqual([
    ...themeTokens('radius'),
  ])
})
