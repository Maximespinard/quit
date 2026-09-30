import type { Protocol } from '@quit/contract/settings'
import { factId } from '@/shared/utils/fact-id'
import type { Journal } from './journal'
import { setProtocol } from './protocol'
import { protocolPosition } from './protocol-position'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const NOW = Date.UTC(2026, 8, 22, 10, 0, 0)

const TAPER: Protocol = [
  { doseMg: 21, durationDays: 28 },
  { doseMg: 14, durationDays: 14 },
  { doseMg: 7, durationDays: 7 },
]
const positionAt = (quitMoment: number, now: number, protocol: Protocol = TAPER) =>
  protocolPosition(protocol, quitMoment, now)

describe('protocolPosition', () => {
  it('starts on day 1 of the first step at the quit moment', () => {
    expect(positionAt(NOW, NOW)).toEqual({
      status: 'running',
      stepNumber: 1,
      stepCount: 3,
      step: { doseMg: 21, durationDays: 28 },
      dayInStep: 1,
      daysLeft: 28,
      endsAt: NOW + 28 * DAY,
      nextStep: { doseMg: 14, durationDays: 14 },
    })
  })

  it('ends the running step where the next one, or the end of the protocol, begins', () => {
    const quitMoment = NOW - (30 * DAY + 5 * HOUR)

    expect(positionAt(quitMoment, NOW)).toMatchObject({
      stepNumber: 2,
      endsAt: quitMoment + 42 * DAY,
    })
    expect(positionAt(NOW - 45 * DAY, NOW)).toMatchObject({ stepNumber: 3, endsAt: NOW + 4 * DAY })
    expect(positionAt(NOW + HOUR, NOW)).toMatchObject({
      stepNumber: 1,
      endsAt: NOW + HOUR + 28 * DAY,
    })
  })

  it('counts days in whole 24 h blocks from a backdated quit moment', () => {
    expect(positionAt(NOW - (9 * DAY + 23 * HOUR), NOW)).toMatchObject({
      stepNumber: 1,
      dayInStep: 10,
      daysLeft: 19,
    })
  })

  it('moves to the next step exactly when the previous one ends', () => {
    expect(positionAt(NOW - 28 * DAY + MINUTE, NOW)).toMatchObject({
      stepNumber: 1,
      dayInStep: 28,
      daysLeft: 1,
    })
    expect(positionAt(NOW - 28 * DAY, NOW)).toMatchObject({
      stepNumber: 2,
      step: { doseMg: 14 },
      dayInStep: 1,
      daysLeft: 14,
    })
  })

  it('has no next step on the last step', () => {
    expect(positionAt(NOW - 45 * DAY, NOW)).toMatchObject({
      stepNumber: 3,
      dayInStep: 4,
      daysLeft: 4,
      nextStep: null,
    })
  })

  it('is over once the clock passes the end of the protocol', () => {
    expect(positionAt(NOW - 49 * DAY, NOW)).toEqual({ status: 'over' })
    expect(positionAt(NOW - 400 * DAY, NOW)).toEqual({ status: 'over' })
  })

  it('waits on day 1 while now is still before the quit moment', () => {
    expect(positionAt(NOW + HOUR, NOW)).toMatchObject({ stepNumber: 1, dayInStep: 1 })
  })

  it('follows a step shortened mid-step', () => {
    const quitMoment = NOW - 10 * DAY
    const journal: Journal = {
      facts: [{ type: 'quit-moment', id: factId(1), at: quitMoment }],
      protocol: TAPER,
      weeklySpendCents: null,
      baselineSmokesPerDay: null,
      goal: null,
    }
    const edited = setProtocol(journal, [{ doseMg: 21, durationDays: 7 }, ...TAPER.slice(1)])
    if (!edited.ok) throw new Error('the edit should be accepted')

    expect(positionAt(quitMoment, NOW, edited.journal.protocol)).toMatchObject({
      stepNumber: 2,
      step: { doseMg: 14 },
      dayInStep: 4,
      daysLeft: 11,
    })
  })

  it('follows a step extended mid-step', () => {
    const extended: Protocol = [{ doseMg: 21, durationDays: 42 }, ...TAPER.slice(1)]

    expect(positionAt(NOW - 30 * DAY, NOW, extended)).toMatchObject({
      stepNumber: 1,
      dayInStep: 31,
      daysLeft: 12,
    })
  })

  it('follows a step removed', () => {
    const withoutMiddle: Protocol = [
      { doseMg: 21, durationDays: 28 },
      { doseMg: 7, durationDays: 7 },
    ]

    expect(positionAt(NOW - 30 * DAY, NOW, withoutMiddle)).toMatchObject({
      stepNumber: 2,
      stepCount: 2,
      step: { doseMg: 7 },
      dayInStep: 3,
      daysLeft: 5,
      nextStep: null,
    })
  })
})
