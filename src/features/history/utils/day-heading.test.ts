import { dayHeading } from './day-heading'

const NOW = new Date(2026, 8, 22, 10, 0).getTime()
const midnight = (year: number, month: number, day: number) => new Date(year, month, day).getTime()

it('names today and yesterday, any other day by its date', () => {
  expect(dayHeading(midnight(2026, 8, 22), NOW)).toBe('Aujourd’hui')
  expect(dayHeading(midnight(2026, 8, 21), NOW)).toBe('Hier')
  expect(dayHeading(midnight(2026, 8, 17), NOW)).toBe('jeudi 17 septembre')
})

it('adds the year to a day of another year', () => {
  expect(dayHeading(midnight(2025, 11, 31), NOW)).toBe('mercredi 31 décembre 2025')
})
