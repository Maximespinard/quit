import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CalendarDay } from '../domain/patch-calendar'
import { DayCell } from './DayCell'

const DAY = new Date(2026, 0, 10).getTime()
const OUTLINES = ['red', 'blue']

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
  render(
    <table>
      <tbody>
        <tr>
          <DayCell
            cell={{ day: DAY, calendarDay: calendarDay(overrides) }}
            todayStart={todayStart}
            outlines={OUTLINES}
          />
        </tr>
      </tbody>
    </table>,
  )
  const cell = screen.getByRole('cell').firstElementChild
  if (!(cell instanceof HTMLElement)) throw new Error('the cell holds no day')
  return cell
}

/** The row of marks under the date: its children are the marks drawn. */
const marksOf = (cell: HTMLElement) => cell.children[1]

describe('DayCell', () => {
  it('writes a lived day’s craving count beside the timer icon and fills the cell', () => {
    const cell = cellOf({ cravings: 3 }, DAY)

    expect(cell).toHaveTextContent('3')
    expect(cell.style.backgroundColor).not.toBe('')
    expect(cell.style.borderColor).toBe('')
  })

  it('draws no count on a day without craving, yet still fills it', () => {
    const cell = cellOf({}, DAY)

    expect(marksOf(cell)?.querySelector('svg')).toBeNull()
    expect(cell.style.backgroundColor).not.toBe('')
  })

  it('draws no mark on a day with its patch logged and nothing else', () => {
    expect(marksOf(cellOf({ patch: 'logged' }, DAY))?.children).toHaveLength(0)
  })

  it('draws the patch mark of a missing patch', () => {
    expect(marksOf(cellOf({ patch: 'missing' }, DAY))?.children).toHaveLength(1)
  })

  it('outlines a day to come with its step’s outline and never fills it', () => {
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
