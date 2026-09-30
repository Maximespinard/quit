import { factIdSequence } from '@/shared/test/fact-ids'
import { journalWithLapses } from '@/shared/test/journals'
import { local } from '@/shared/test/local-time'
import { factId } from '@/shared/utils/fact-id'
import { derive } from './derive'
import { decodeJournal, emptyJournal, type Journal } from './journal'
import { defaultProtocol } from './protocol'
import { type ScenarioId, scenarioById } from './scenarios'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const NOW = Date.UTC(2026, 8, 22, 10, 0, 0)

// Quit on 1 January at 20:00; the lapses below fall on the following days.
const QUIT = local(1, 1, 20)
const derivedAt = (now: number, lapses: readonly number[]) =>
  derive(journalWithLapses(QUIT, lapses), now)

describe('derive', () => {
  it('derives nothing from an empty journal', () => {
    expect(derive(emptyJournal, NOW)).toEqual({
      quitMoment: null,
      streak: null,
      personalBest: null,
      lastCigarette: null,
      lapseDaysInARow: null,
      relapses: null,
      cigarettesSmoked: null,
      moneySavedCents: null,
      cigarettesNotSmoked: null,
      goal: null,
      smokeFreeDays: null,
      protocol: null,
      patch: null,
      suggestedSite: null,
      previousSite: null,
      cravingStats: null,
    })
  })

  it('starts the streak at zero when the quit moment is now', () => {
    expect(derive(journalWithLapses(NOW), NOW)).toMatchObject({
      quitMoment: NOW,
      streak: { elapsedMs: 0 },
    })
  })

  it('measures the streak from a backdated quit moment', () => {
    const quitMoment = NOW - (3 * DAY + 7 * HOUR + 4 * MINUTE)

    expect(derive(journalWithLapses(quitMoment), NOW)).toMatchObject({
      quitMoment,
      streak: { elapsedMs: 3 * DAY + 7 * HOUR + 4 * MINUTE },
    })
  })

  it('measures the streak from the latest quit moment recorded', () => {
    const first = NOW - 10 * DAY
    const corrected = NOW - 2 * DAY
    const journal: Journal = {
      protocol: defaultProtocol,
      weeklySpendCents: null,
      baselineSmokesPerDay: null,
      goal: null,
      facts: [
        { type: 'quit-moment', id: factId(1), at: first },
        { type: 'quit-moment', id: factId(2), at: corrected },
      ],
    }

    expect(derive(journal, NOW)).toMatchObject({
      quitMoment: corrected,
      streak: { elapsedMs: 2 * DAY },
    })
  })

  it('holds the streak at zero while now is still before the quit moment', () => {
    const quitMoment = NOW + HOUR

    expect(derive(journalWithLapses(quitMoment), NOW)).toMatchObject({
      quitMoment,
      streak: { elapsedMs: 0 },
    })
  })
})

describe('derive — the lapses it counts', () => {
  it('ignores a lapse before the quit moment, left behind by a corrected quit moment', () => {
    const journal: Journal = {
      protocol: defaultProtocol,
      weeklySpendCents: null,
      baselineSmokesPerDay: null,
      goal: null,
      facts: [
        { type: 'quit-moment', id: factId(1), at: NOW - 10 * DAY },
        { type: 'lapse', id: factId(2), at: NOW - 8 * DAY, count: 1 },
        { type: 'quit-moment', id: factId(3), at: NOW - 4 * DAY },
      ],
    }

    expect(derive(journal, NOW)).toMatchObject({
      streak: { elapsedMs: 4 * DAY },
      lastCigarette: null,
      cigarettesSmoked: 0,
    })
  })

  it('ignores a lapse that has not happened yet on a clock moved back', () => {
    const journal = journalWithLapses(NOW - 10 * DAY, [NOW + HOUR])

    expect(derive(journal, NOW)).toMatchObject({
      streak: { elapsedMs: 10 * DAY },
      lastCigarette: null,
    })
  })

  it('leaves the protocol position exactly where it was after a relapse', () => {
    const now = local(1, 20)
    const before = derivedAt(now, []).protocol
    const after = derivedAt(
      now,
      [5, 6, 7].map((day) => local(1, day, 10)),
    ).protocol

    expect(after).toEqual(before)
  })
})

describe('derive — cigarettes smoked', () => {
  it('adds up every lapse’s cigarettes', () => {
    const journal: Journal = {
      protocol: defaultProtocol,
      weeklySpendCents: null,
      baselineSmokesPerDay: null,
      goal: null,
      facts: [
        { type: 'quit-moment', id: factId(1), at: QUIT },
        { type: 'lapse', id: factId(2), at: local(1, 5, 10), count: 3 },
        { type: 'lapse', id: factId(3), at: local(1, 9, 10), count: 1 },
      ],
    }

    expect(derive(journal, local(1, 10)).cigarettesSmoked).toBe(4)
  })

  it('reads a stored lapse without a count as one cigarette', () => {
    const stored = {
      facts: [
        { type: 'quit-moment', id: factId(1), at: QUIT },
        { type: 'lapse', id: factId(2), at: local(1, 5, 10) },
      ],
    }

    expect(derive(decodeJournal(stored, factIdSequence()), local(1, 10)).cigarettesSmoked).toBe(1)
  })
})

// The scenarios are one source: the debug panel loads what these expectations pin down.
describe('derive — scenarios', () => {
  const derived = (id: ScenarioId) => {
    const { journal, now } = scenarioById(id)
    return { now, ...derive(journal, now) }
  }

  it('day 3, mid-craving: the first step, today’s patch on, one smoke-free day', () => {
    expect(derived('day-3-craving')).toMatchObject({
      streak: { elapsedMs: 2 * DAY + 7 * HOUR + 30 * MINUTE },
      smokeFreeDays: 1,
      lastCigarette: null,
      protocol: { stepNumber: 1, dayInStep: 3, daysLeft: 26 },
      patch: { status: 'logged', doseMg: 21 },
    })
  })

  it('the eve of a step-down: the last day of the first step', () => {
    const { now, ...state } = derived('step-down-eve')

    expect(state).toMatchObject({
      streak: { elapsedMs: 27 * DAY + 11 * HOUR },
      smokeFreeDays: 26,
      protocol: {
        stepNumber: 1,
        dayInStep: 28,
        daysLeft: 1,
        endsAt: now + 13 * HOUR,
        nextStep: { doseMg: 14 },
      },
      patch: { status: 'logged', doseMg: 21 },
    })
  })

  it('day 29: the first day of the second step, its patch still to put on', () => {
    expect(derived('day-29')).toMatchObject({
      streak: { elapsedMs: 28 * DAY + HOUR + 15 * MINUTE },
      smokeFreeDays: 27,
      protocol: { stepNumber: 2, dayInStep: 1, step: { doseMg: 14 } },
      patch: { status: 'due', doseMg: 14 },
    })
  })

  it('day 45 with a lapse yesterday: a slip, the streak running, the day lost', () => {
    expect(derived('day-45-lapse')).toMatchObject({
      streak: { elapsedMs: 44 * DAY + 2 * HOUR },
      personalBest: null,
      lastCigarette: { elapsedMs: 12 * HOUR + 20 * MINUTE },
      lapseDaysInARow: 1,
      relapses: [],
      cigarettesSmoked: 1,
      smokeFreeDays: 42,
      protocol: { stepNumber: 2, dayInStep: 17, daysLeft: 12 },
      patch: { status: 'logged', doseMg: 14 },
    })
  })

  it('protocol finished, patch-free for a week: nothing more to put on, the streak goes on', () => {
    expect(derived('protocol-over')).toMatchObject({
      streak: { elapsedMs: 91 * DAY + 3 * HOUR },
      smokeFreeDays: 90,
      lastCigarette: null,
      protocol: { status: 'over' },
      patch: { status: 'over' },
    })
  })
})
