import { describe, expect, it } from 'vitest'
import { countUpAt } from './count-up'

describe('countUpAt', () => {
  it('starts at 0 and lands on the target', () => {
    expect(countUpAt(47, 0)).toBe(0)
    expect(countUpAt(47, 1)).toBe(47)
  })

  it('moves a small figure one whole unit at a time', () => {
    const shown = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((step) => countUpAt(3, step / 12))
    expect([...new Set(shown)]).toEqual([0, 1, 2, 3])
  })

  it('only ever shows whole numbers on the way', () => {
    for (let step = 0; step <= 12; step += 1) {
      expect(Number.isInteger(countUpAt(365, step / 12))).toBe(true)
    }
  })

  it('shows 0 for a target of 0', () => {
    expect(countUpAt(0, 0.5)).toBe(0)
  })
})
