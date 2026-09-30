import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CalendarDay } from '../domain/patch-calendar'
import { DayCell } from './DayCell'

const DAY = new Date(2026, 0, 10).getTime()
const TINTS = ['red', 'blue']

const calendarDay = (overrides: Partial<CalendarDay>): CalendarDay => ({
  day: DAY,
  step: 1,
  startingStep: null,
  patch: 'logged',
  cigarettes: 0,
  cravings: 0,
  isToday: false,
  isEnd: false,
  ...overrides,
})

function cellOf(overrides: Partial<CalendarDay>, todayStart: number) {
  const { container } = render(
    <table>
      <tbody>
        <tr>
          <DayCell
            cell={{ day: DAY, calendarDay: calendarDay(overrides) }}
            todayStart={todayStart}
            tints={TINTS}
          />
        </tr>
      </tbody>
    </table>,
  )
  return container.querySelector('td > div') as HTMLElement
}

describe('DayCell', () => {
  it('writes a lived day’s craving count beside the timer icon and fills the cell', () => {
    const cell = cellOf({ cravings: 3 }, DAY)

    expect(cell).toHaveTextContent('3')
    expect(cell.style.backgroundColor).not.toBe('')
    expect(cell.style.borderColor).toBe('')
  })

  it('draws no count on a day without craving, yet still fills it', () => {
    const cell = cellOf({}, DAY)

    expect(cell).not.toHaveTextContent(/\d\d?$/)
    expect(cell.style.backgroundColor).not.toBe('')
  })

  it('outlines a day to come with its step’s tint and never fills it', () => {
    const cell = cellOf({ step: 2 }, DAY - 1)

    expect(cell.style.backgroundColor).toBe('')
    expect(cell.style.borderColor).toBe('blue')
  })

  it('leaves a day after the protocol’s end bare', () => {
    const cell = cellOf({ step: null, patch: null }, DAY)

    expect(cell.style.backgroundColor).toBe('')
    expect(cell.style.borderColor).toBe('')
    expect(screen.getByText('10')).toBeInTheDocument()
  })
})
