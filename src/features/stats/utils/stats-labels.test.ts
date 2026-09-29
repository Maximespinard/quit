import { bucketLabel, percentOf, stepMarkers, tagLabel } from './stats-labels'

const local = (month: number, day: number) => new Date(2026, month - 1, day).getTime()

describe('stats labels', () => {
  it('names a default tag in French and keeps a typed tag’s own words', () => {
    expect(tagLabel('coffee')).toBe('Café')
    expect(tagLabel('Jeu vidéo')).toBe('Jeu vidéo')
  })

  it('rounds a share to a whole percentage, and gives 0 out of nothing', () => {
    expect(percentOf(69, 92)).toBe(75)
    expect(percentOf(2, 3)).toBe(67)
    expect(percentOf(0, 0)).toBe(0)
  })

  it('names a day by its date and a week by its first and last days, across a DST change', () => {
    const day = {
      start: local(3, 29),
      end: local(3, 30),
      days: 1,
      count: 0,
      averageIntensity: null,
    }
    // The week holding the 23 h day of 29 March 2026 still ends on the Monday.
    const week = {
      start: local(3, 24),
      end: local(3, 31),
      days: 7,
      count: 0,
      averageIntensity: null,
    }

    expect(bucketLabel(day, 'day')).toBe('29 mars')
    expect(bucketLabel(week, 'week')).toBe('24 mars – 30 mars')
  })

  it('rules each bucket once, two step changes in one bucket sharing its label', () => {
    expect(
      stepMarkers([
        { bucketIndex: 2, stepNumber: 2, doseMg: 14 },
        { bucketIndex: 2, stepNumber: 3, doseMg: 7 },
        { bucketIndex: 5, stepNumber: 4, doseMg: 3.5 },
      ]),
    ).toEqual([
      { index: 2, label: '14 → 7 mg' },
      { index: 5, label: '3,5 mg' },
    ])
  })
})
