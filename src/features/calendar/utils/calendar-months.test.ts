import { patchCalendar } from '@/shared/domain/patch-calendar'
import { defaultProtocol } from '@/shared/domain/protocol'
import { calendarMonths, monthIndexAt } from './calendar-months'

const local = (month: number, day: number, hour = 0) =>
  new Date(2026, month - 1, day, hour).getTime()

/** Friday 30 January 2026, 09:00, on the default 84-day protocol: ends Friday 24 April. */
const daysFrom = (now: number) => {
  const calendar = patchCalendar(
    {
      facts: [{ type: 'quit-moment', at: local(1, 30, 9) }],
      protocol: defaultProtocol,
      weeklySpendCents: null,
      baselineSmokesPerDay: null,
      goal: null,
    },
    now,
  )
  if (calendar === null) throw new Error('No calendar')
  return calendar.days
}

describe('calendarMonths', () => {
  const months = calendarMonths(daysFrom(local(2, 2, 10)))

  it('covers every month the calendar touches, whole', () => {
    expect(months.map((month) => month.month)).toEqual([
      local(1, 1),
      local(2, 1),
      local(3, 1),
      local(4, 1),
    ])
  })

  it('lays each month Monday first, padded to whole weeks', () => {
    // January 2026 opens on a Thursday: three blanks, then 1 to 31, then one blank.
    const [january] = months
    expect(january?.weeks[0]?.map((cell) => cell?.day ?? null)).toEqual([
      null,
      null,
      null,
      local(1, 1),
      local(1, 2),
      local(1, 3),
      local(1, 4),
    ])
    expect(january?.weeks.flat().filter((cell) => cell !== null)).toHaveLength(31)
    expect(january?.weeks.at(-1)?.at(-1)).toBeNull()
  })

  it('keeps days outside the calendar as bare dates', () => {
    const cells = months[0]?.weeks.flat() ?? []
    expect(cells.find((cell) => cell?.day === local(1, 29))?.calendarDay).toBeNull()
    expect(cells.find((cell) => cell?.day === local(1, 30))?.calendarDay?.step).toBe(1)
  })

  it('crosses the October daylight-saving change with 31 dates', () => {
    const october = calendarMonths(daysFrom(local(10, 30, 10))).at(-1)
    expect(october?.month).toBe(local(10, 1))
    expect(october?.weeks.flat().filter((cell) => cell !== null)).toHaveLength(31)
  })
})

describe('monthIndexAt', () => {
  const months = calendarMonths(daysFrom(local(2, 2, 10)))

  it('opens on the month holding now', () => {
    expect(monthIndexAt(months, local(3, 15, 10))).toBe(2)
  })

  it('falls back on the nearest month outside the range', () => {
    expect(monthIndexAt(months, local(1, 1) - 1)).toBe(0)
    expect(monthIndexAt(months, local(6, 1))).toBe(3)
  })
})
