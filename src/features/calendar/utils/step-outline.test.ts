import { describe, expect, it } from 'vitest'
import type { CalendarStep } from '../domain/patch-calendar'
import { stepOutlines } from './step-outline'

const stepOf = (number: number, doseMg: number): CalendarStep => ({
  number,
  step: { doseMg, durationDays: 28 },
  startsAt: 0,
  endsAt: 0,
  firstDay: 0,
  lastDay: 0,
})

const share = (tint: string | undefined) => tint?.match(/(\d+)%, transparent\)$/)?.[1]

describe('stepOutlines', () => {
  it('spreads the doses evenly, lowest faintest, highest strongest', () => {
    const outlines = stepOutlines([stepOf(1, 21), stepOf(2, 14), stepOf(3, 7)])

    expect(outlines.map(share)).toEqual(['100', '70', '40'])
  })

  it('spreads by rank, so two close doses stay clearly apart', () => {
    const outlines = stepOutlines([stepOf(1, 21), stepOf(2, 20), stepOf(3, 7)])

    expect(outlines.map(share)).toEqual(['100', '70', '40'])
  })

  it('takes the strongest when every step has the same dose', () => {
    expect(stepOutlines([stepOf(1, 14), stepOf(2, 14)]).map(share)).toEqual(['100', '100'])
  })
})
