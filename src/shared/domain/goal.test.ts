import { DAY_MS } from '@/shared/utils/duration'
import { derive } from './derive'
import { markGoalCelebrated, setGoal } from './goal'
import { decodeJournal, emptyJournal, type Journal } from './journal'

const NOW = Date.UTC(2026, 8, 22, 10, 0, 0)

/** Quit `days` days before `NOW` at 35 € a week and 15 a day: 5 € saved a day. */
const quitDaysAgo = (days: number): Journal => ({
  ...emptyJournal,
  weeklySpendCents: 3_500,
  baselineSmokesPerDay: 15,
  facts: [{ type: 'quit-moment', at: NOW - days * DAY_MS }],
})

function withGoal(journal: Journal, label: string, priceCents: number, now = NOW): Journal {
  const result = setGoal(journal, { label, priceCents }, now)
  if (!result.ok) throw new Error(`goal refused: ${result.reason}`)
  return result.journal
}

describe('setGoal', () => {
  it('stores the label, trimmed, and the price in integer cents', () => {
    const journal = withGoal(quitDaysAgo(2), '  Un casque  ', 12_000)

    expect(journal.goal).toEqual({
      label: 'Un casque',
      priceCents: 12_000,
      countsFrom: null,
      celebrated: false,
    })
  })

  it.each([
    ['blank', '   ', 12_000, 'invalid-label'],
    ['too long', 'x'.repeat(61), 12_000, 'invalid-label'],
    ['free', 'Un casque', 0, 'invalid-price'],
    ['a fraction of a cent', 'Un casque', 99.5, 'invalid-price'],
  ])('refuses a goal that is %s', (_, label, priceCents, reason) => {
    expect(setGoal(quitDaysAgo(2), { label, priceCents }, NOW)).toEqual({ ok: false, reason })
  })

  it('keeps counting from the same point when a goal not reached is replaced', () => {
    const first = withGoal(quitDaysAgo(10), 'Un vélo', 40_000)
    const replaced = withGoal(first, 'Un casque', 12_000)

    // Changing one's mind costs nothing: 50 € already count towards the new goal.
    expect(replaced.goal?.countsFrom).toBeNull()
    expect(derive(replaced, NOW).goal).toMatchObject({ savedCents: 5_000, reached: false })
  })

  it('starts again from zero when it replaces a goal reached', () => {
    const reached = withGoal(quitDaysAgo(30), 'Un casque', 12_000)
    const next = withGoal(reached, 'Un vélo', 40_000)

    expect(next.goal).toEqual({
      label: 'Un vélo',
      priceCents: 40_000,
      countsFrom: NOW,
      celebrated: false,
    })
    expect(derive(next, NOW).goal).toMatchObject({ savedCents: 0 })
    expect(derive(next, NOW + 4 * DAY_MS).goal).toMatchObject({ savedCents: 2_000 })
  })
})

describe('derive, goal', () => {
  it('derives no goal until one is set', () => {
    expect(derive(quitDaysAgo(3), NOW).goal).toBeNull()
  })

  it('shows the money saved since the quit moment as progress', () => {
    const journal = withGoal(quitDaysAgo(3), 'Un casque', 12_000)

    expect(derive(journal, NOW).goal).toEqual({
      label: 'Un casque',
      priceCents: 12_000,
      savedCents: 1_500,
      reached: false,
      celebrated: false,
    })
  })

  it('grows with time and is reached once the money saved meets the price', () => {
    const journal = withGoal(quitDaysAgo(3), 'Un casque', 12_000)

    expect(derive(journal, NOW + 20 * DAY_MS).goal).toMatchObject({
      savedCents: 11_500,
      reached: false,
    })
    expect(derive(journal, NOW + 21 * DAY_MS).goal).toMatchObject({
      savedCents: 12_000,
      reached: true,
    })
  })

  it('follows a lapse recorded after the goal', () => {
    const journal = withGoal(quitDaysAgo(24), 'Un casque', 12_000)
    const lapsed: Journal = {
      ...journal,
      facts: [...journal.facts, { type: 'lapse', at: NOW - DAY_MS, count: 3 }],
    }

    expect(derive(lapsed, NOW).goal).toMatchObject({ savedCents: 11_900, reached: false })
  })

  it('derives no progress without the weekly spend', () => {
    const journal = withGoal(quitDaysAgo(3), 'Un casque', 12_000)

    expect(derive({ ...journal, weeklySpendCents: null }, NOW).goal).toBeNull()
  })
})

describe('markGoalCelebrated', () => {
  it('remembers the celebration was seen, once and for all', () => {
    const celebrated = markGoalCelebrated(withGoal(quitDaysAgo(30), 'Un casque', 12_000))

    expect(celebrated.goal?.celebrated).toBe(true)
    expect(derive(celebrated, NOW).goal).toMatchObject({ reached: true, celebrated: true })
  })

  it('leaves a journal without a goal unchanged', () => {
    const journal = quitDaysAgo(3)

    expect(markGoalCelebrated(journal)).toBe(journal)
  })
})

describe('derive, goal reached then a lapse', () => {
  // Reached on day 24 exactly: 120 € at 5 € a day. Three cigarettes cost 1 €.
  const reachedThenLapsed = (seen: boolean): Journal => {
    const set = withGoal(quitDaysAgo(24), 'Un casque', 12_000)
    const journal = seen ? markGoalCelebrated(set) : set
    return { ...journal, facts: [...journal.facts, { type: 'lapse', at: NOW - DAY_MS, count: 3 }] }
  }

  it('stays reached once its celebration was seen: the money went on it', () => {
    expect(derive(reachedThenLapsed(true), NOW).goal).toMatchObject({
      savedCents: 11_900,
      reached: true,
    })
    // So the next goal starts from zero, as after any goal reached.
    expect(withGoal(reachedThenLapsed(true), 'Un vélo', 40_000).goal?.countsFrom).toBe(NOW)
  })

  it('is not reached while nobody saw it reached', () => {
    expect(derive(reachedThenLapsed(false), NOW).goal).toMatchObject({ reached: false })
  })
})

describe('decodeJournal, goal', () => {
  it('reads back a stored goal', () => {
    const goal = { label: 'Un vélo', priceCents: 40_000, countsFrom: NOW, celebrated: true }

    expect(decodeJournal({ facts: [], goal }).goal).toEqual(goal)
  })

  it('reads a journal stored before goals existed as having none', () => {
    expect(decodeJournal({ facts: [] }).goal).toBeNull()
  })

  it.each([
    ['without a label', { priceCents: 40_000, countsFrom: null, celebrated: false }],
    [
      'at a fraction of a cent',
      { label: 'Un vélo', priceCents: 1.5, countsFrom: null, celebrated: false },
    ],
    [
      'counting from nowhere',
      { label: 'Un vélo', priceCents: 400, countsFrom: 'x', celebrated: false },
    ],
  ])('drops a goal %s', (_, goal) => {
    expect(decodeJournal({ facts: [], goal }).goal).toBeNull()
  })
})
