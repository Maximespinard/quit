import { expect, it } from 'vitest'
import { streakFigureSize } from './streak-figure'

it('keeps the full hero size up to two digits', () => {
  expect(streakFigureSize(0)).toBe('62cqi')
  expect(streakFigureSize(9)).toBe('62cqi')
  expect(streakFigureSize(99)).toBe('62cqi')
})

it('shrinks a longer streak so it never runs past the hero', () => {
  expect(streakFigureSize(100)).toBe('48cqi')
  expect(streakFigureSize(999)).toBe('48cqi')
  expect(streakFigureSize(1000)).toBe('36cqi')
})
