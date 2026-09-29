import {
  APPLICATION_SITES,
  type ApplicationSite,
  type Fact,
  type PatchApplicationFact,
} from '@quit/contract/facts'
import type { Protocol } from '@quit/contract/settings'
import { derive } from './derive'
import { recordLapse } from './facts/lapse'
import { recordPatchApplication } from './facts/patch-application'
import { decodeJournal, emptyJournal, type Journal } from './journal'
import { patchCalendar } from './patch-calendar'
import { defaultProtocol, setProtocol } from './protocol'
import { type ScenarioId, scenarioById, scenarios } from './scenarios'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const NOW = Date.UTC(2026, 8, 22, 10, 0, 0)

const journalWithQuitMoment = (at: number, protocol: Protocol = defaultProtocol): Journal => ({
  facts: [{ type: 'quit-moment', at }],
  protocol,
  weeklySpendCents: null,
  baselineSmokesPerDay: null,
  goal: null,
})

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
    expect(derive(journalWithQuitMoment(NOW), NOW)).toMatchObject({
      quitMoment: NOW,
      streak: { elapsedMs: 0 },
    })
  })

  it('measures the streak from a backdated quit moment', () => {
    const quitMoment = NOW - (3 * DAY + 7 * HOUR + 4 * MINUTE)

    expect(derive(journalWithQuitMoment(quitMoment), NOW)).toMatchObject({
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
        { type: 'quit-moment', at: first },
        { type: 'quit-moment', at: corrected },
      ],
    }

    expect(derive(journal, NOW)).toMatchObject({
      quitMoment: corrected,
      streak: { elapsedMs: 2 * DAY },
    })
  })

  it('holds the streak at zero while now is still before the quit moment', () => {
    const quitMoment = NOW + HOUR

    expect(derive(journalWithQuitMoment(quitMoment), NOW)).toMatchObject({
      quitMoment,
      streak: { elapsedMs: 0 },
    })
  })
})

describe('derive — protocol position', () => {
  const TAPER: Protocol = [
    { doseMg: 21, durationDays: 28 },
    { doseMg: 14, durationDays: 14 },
    { doseMg: 7, durationDays: 7 },
  ]
  const positionAt = (quitMoment: number, now: number, protocol: Protocol = TAPER) =>
    derive(journalWithQuitMoment(quitMoment, protocol), now).protocol

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
    const journal = journalWithQuitMoment(NOW - 10 * DAY, TAPER)
    const edited = setProtocol(journal, [{ doseMg: 21, durationDays: 7 }, ...TAPER.slice(1)])
    if (!edited.ok) throw new Error('the edit should be accepted')

    expect(derive(edited.journal, NOW).protocol).toMatchObject({
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

describe('derive — today’s patch application', () => {
  // Today is the local calendar day holding `now`, wherever the quit moment sits in it.
  const local = (month: number, day: number, hour: number, minute = 0) =>
    new Date(2026, month - 1, day, hour, minute).getTime()
  // An evening quit: Sunday 20 September, 20:00.
  const QUIT = local(9, 20, 20)
  const applied = (at: number, doseMg = 21): PatchApplicationFact => ({
    type: 'patch-application',
    at,
    doseMg,
  })
  const journalOf = (
    facts: readonly PatchApplicationFact[],
    protocol: Protocol = defaultProtocol,
    quitMoment = QUIT,
  ): Journal => ({
    ...emptyJournal,
    protocol,
    facts: [{ type: 'quit-moment', at: quitMoment }, ...facts],
  })
  const patchAt = (now: number, ...applications: PatchApplicationFact[]) =>
    derive(journalOf(applications), now).patch

  it('is due with the running step’s dose while nothing is put on today', () => {
    expect(patchAt(local(9, 22, 9))).toEqual({ status: 'due', doseMg: 21 })
  })

  it('is logged once a patch application is put on today, with its time and dose', () => {
    expect(patchAt(local(9, 22, 9), applied(local(9, 22, 8, 15), 14))).toEqual({
      status: 'logged',
      at: local(9, 22, 8, 15),
      doseMg: 14,
    })
  })

  it('carries the application site of the patch application logged', () => {
    expect(
      patchAt(local(9, 22, 9), { ...applied(local(9, 22, 8, 15)), site: 'arm-right' }),
    ).toMatchObject({ status: 'logged', site: 'arm-right' })
  })

  it('after an evening quit, counts the 08:00 patch as today’s all evening', () => {
    expect(patchAt(local(9, 21, 21), applied(local(9, 21, 8)))).toEqual({
      status: 'logged',
      at: local(9, 21, 8),
      doseMg: 21,
    })
  })

  it('asks for the new day’s patch just after midnight', () => {
    const lateEvening = applied(local(9, 21, 23, 59))

    expect(patchAt(local(9, 21, 23, 59), lateEvening)).toMatchObject({ status: 'logged' })
    expect(patchAt(local(9, 22, 0, 1), lateEvening)).toEqual({ status: 'due', doseMg: 21 })
  })

  it('counts a patch application put on at midnight sharp as the new day’s', () => {
    expect(patchAt(local(9, 22, 0, 30), applied(local(9, 22, 0)))).toMatchObject({
      status: 'logged',
    })
  })

  it('counts a patch application backdated to earlier today', () => {
    const now = local(9, 22, 10)
    const backdated = recordPatchApplication(
      journalOf([]),
      { at: local(9, 22, 7), doseMg: 21 },
      now,
    )
    if (!backdated.ok) throw new Error('the backdated application should be accepted')

    expect(derive(backdated.journal, now).patch).toEqual({
      status: 'logged',
      at: local(9, 22, 7),
      doseMg: 21,
    })
  })

  it('leaves today due when the backdated patch application is for yesterday', () => {
    expect(patchAt(local(9, 22, 10), applied(local(9, 21, 23)))).toMatchObject({
      status: 'due',
    })
  })

  it('shows the latest of several patch applications put on today', () => {
    expect(
      patchAt(local(9, 22, 17), applied(local(9, 22, 12), 14), applied(local(9, 22, 7))),
    ).toEqual({ status: 'logged', at: local(9, 22, 12), doseMg: 14 })
  })

  it('shows the one recorded last when two patch applications share the same instant', () => {
    expect(
      patchAt(local(9, 22, 17), applied(local(9, 22, 12)), applied(local(9, 22, 12), 14)),
    ).toEqual({ status: 'logged', at: local(9, 22, 12), doseMg: 14 })
  })

  it('ignores a patch application later than now (a clock moved back)', () => {
    expect(patchAt(local(9, 22, 9), applied(local(9, 22, 10)))).toMatchObject({ status: 'due' })
  })

  it('offers the first patch on the quit day, never asks for it', () => {
    expect(patchAt(QUIT)).toEqual({ status: 'offered', doseMg: 21 })
    expect(patchAt(local(9, 20, 23, 59))).toEqual({ status: 'offered', doseMg: 21 })
  })

  it('shows a patch put on on the quit day as logged', () => {
    expect(patchAt(local(9, 20, 21), applied(local(9, 20, 20, 30)))).toMatchObject({
      status: 'logged',
    })
  })

  it('offers it with the clock moved before the quit moment (the sandbox)', () => {
    expect(patchAt(QUIT - HOUR)).toEqual({ status: 'offered', doseMg: 21 })
    expect(patchAt(QUIT - 2 * DAY)).toEqual({ status: 'offered', doseMg: 21 })
  })

  it('counts from a quit moment corrected later: its day is the quit day', () => {
    const journal: Journal = {
      ...emptyJournal,
      facts: [
        { type: 'quit-moment', at: QUIT },
        applied(local(9, 22, 8)),
        { type: 'quit-moment', at: local(9, 22, 12) },
      ],
    }

    expect(derive(journal, local(9, 22, 20)).patch).toEqual({ status: 'offered', doseMg: 21 })
  })

  it('prefills the dose of the step now running', () => {
    expect(patchAt(QUIT + 30 * DAY)).toEqual({ status: 'due', doseMg: 14 })
  })

  describe('at the end of the protocol', () => {
    // Three protocol days: the protocol ends on Wednesday 23 September at 20:00.
    const SHORT: Protocol = [{ doseMg: 7, durationDays: 3 }]
    const shortAt = (now: number, ...applications: PatchApplicationFact[]) =>
      derive(journalOf(applications, SHORT), now).patch

    it('asks for the patch of the last day before the end day', () => {
      expect(shortAt(local(9, 22, 21))).toEqual({ status: 'due', doseMg: 7 })
    })

    it('asks for nothing on the end day, before and after the last patch comes off', () => {
      expect(shortAt(local(9, 23, 9))).toEqual({ status: 'over' })
      expect(shortAt(local(9, 23, 21))).toEqual({ status: 'over' })
    })

    it('shows a patch put on on the end day as logged, even once the protocol is over', () => {
      const endDayPatch = applied(local(9, 23, 8), 7)

      expect(shortAt(local(9, 23, 9), endDayPatch)).toMatchObject({ status: 'logged' })
      expect(shortAt(local(9, 23, 21), endDayPatch)).toMatchObject({ status: 'logged' })
    })

    it('asks for nothing after the end day', () => {
      expect(shortAt(local(9, 30, 9))).toEqual({ status: 'over' })
    })
  })

  describe('across a daylight-saving change', () => {
    const MINUTES_30 = 30 * MINUTE

    /** Every half hour of the day opening at `midnight`, one patch put on at 08:00. */
    function statusesOver(quitMoment: number, midnight: number, nextMidnight: number) {
      const journal = journalOf(
        [applied(new Date(midnight).setHours(8))],
        defaultProtocol,
        quitMoment,
      )
      const statuses: (string | undefined)[] = []
      for (let now = midnight; now < nextMidnight; now += MINUTES_30)
        statuses.push(derive(journal, now).patch?.status)
      return { statuses, nextDay: derive(journal, nextMidnight).patch }
    }

    it('asks for exactly one patch on the spring 23 h day (29 March 2026)', () => {
      const { statuses, nextDay } = statusesOver(local(3, 20, 20), local(3, 29, 0), local(3, 30, 0))

      expect(statuses).toHaveLength(46)
      // The clocks skip 02:00 to 03:00: 08:00 comes 7 h after midnight, 14 half hours.
      expect(statuses).toEqual([...Array(14).fill('due'), ...Array(32).fill('logged')])
      expect(nextDay).toMatchObject({ status: 'due' })
    })

    it('asks for exactly one patch on the autumn 25 h day (25 October 2026)', () => {
      const { statuses, nextDay } = statusesOver(
        local(10, 1, 20),
        local(10, 25, 0),
        local(10, 26, 0),
      )

      expect(statuses).toHaveLength(50)
      // The clocks run 02:00 to 03:00 twice: 08:00 comes 9 h after midnight, 18 half hours.
      expect(statuses).toEqual([...Array(18).fill('due'), ...Array(32).fill('logged')])
      expect(nextDay).toMatchObject({ status: 'due' })
    })
  })
})

describe('derive — today’s patch agrees with the calendar', () => {
  /** What the calendar's today cell says: logged, due, or nothing asked. */
  const calendarSays = (journal: Journal, now: number) =>
    patchCalendar(journal, now)?.days.find((day) => day.isToday)?.patch ?? null
  /** The same question asked of the home's patch of the day. */
  const homeSays = (journal: Journal, now: number) => {
    const { patch } = derive(journal, now)
    return patch === null || patch.status === 'offered' || patch.status === 'over'
      ? null
      : patch.status
  }

  it.each(scenarios.map((scenario) => [scenario.id, scenario] as const))(
    '%s, hour by hour over the two days from its clock',
    (_, { journal, now }) => {
      for (let hour = 0; hour < 48; hour += 1) {
        const at = now + hour * HOUR
        expect(homeSays(journal, at), new Date(at).toString()).toBe(calendarSays(journal, at))
      }
    },
  )

  it('an evening quit with a morning patch most days, hour by hour to past its end', () => {
    const quitMoment = new Date(2026, 8, 20, 20).getTime()
    const facts: Fact[] = [{ type: 'quit-moment', at: quitMoment }]
    // A patch at 08:00 every day but every third, and one on the end day.
    for (let day = 1; day <= 10; day += 1)
      if (day % 3 !== 0)
        facts.push({
          type: 'patch-application',
          at: new Date(2026, 8, 20 + day, 8).getTime(),
          doseMg: 7,
        })
    const journal: Journal = { ...emptyJournal, protocol: [{ doseMg: 7, durationDays: 8 }], facts }

    for (let at = quitMoment - DAY; at < quitMoment + 12 * DAY; at += HOUR)
      expect(homeSays(journal, at), new Date(at).toString()).toBe(calendarSays(journal, at))
  })
})

describe('derive — the suggested application site', () => {
  const QUIT = NOW - 10 * DAY
  const applied = (at: number, site?: ApplicationSite): PatchApplicationFact =>
    site === undefined
      ? { type: 'patch-application', at, doseMg: 21 }
      : { type: 'patch-application', at, doseMg: 21, site }
  const suggestedAt = (now: number, ...applications: PatchApplicationFact[]) =>
    derive({ ...emptyJournal, facts: [{ type: 'quit-moment', at: QUIT }, ...applications] }, now)
      .suggestedSite

  it('suggests nothing without a quit moment', () => {
    expect(derive(emptyJournal, NOW).suggestedSite).toBeNull()
  })

  it('suggests the first site for the first ever patch application', () => {
    expect(suggestedAt(NOW)).toBe('arm-left')
  })

  it('suggests the site after the previous patch application’s one', () => {
    expect(suggestedAt(NOW, applied(QUIT + DAY, 'arm-left'))).toBe('arm-right')
    expect(suggestedAt(NOW, applied(QUIT + DAY, 'chest-right'))).toBe('hip-left')
  })

  it('starts the list over after its last site', () => {
    expect(suggestedAt(NOW, applied(QUIT + DAY, 'hip-right'))).toBe('arm-left')
  })

  it('never suggests the previous patch application’s site, whichever it is', () => {
    for (const site of APPLICATION_SITES) {
      expect(suggestedAt(NOW, applied(QUIT + DAY, site))).not.toBe(site)
    }
  })

  it('rotates on from the site the user switched to, not from the one suggested', () => {
    // `arm-left` was suggested first; the user put the patch on the left hip instead.
    expect(suggestedAt(NOW, applied(QUIT + DAY, 'hip-left'))).toBe('hip-right')
  })

  it('rotates on from the latest site known when the previous patch application has none', () => {
    expect(suggestedAt(NOW, applied(QUIT + DAY, 'chest-left'), applied(QUIT + 2 * DAY))).toBe(
      'chest-right',
    )
  })

  it('suggests the first site when no patch application carries one', () => {
    expect(suggestedAt(NOW, applied(QUIT + DAY), applied(QUIT + 2 * DAY))).toBe('arm-left')
  })

  it('keys on the latest patch application in time, not the one recorded last', () => {
    const journal: Journal = {
      ...emptyJournal,
      facts: [
        { type: 'quit-moment', at: QUIT },
        applied(QUIT + DAY, 'arm-left'),
        applied(QUIT + 3 * DAY, 'chest-left'),
      ],
    }
    // Caught up later: the day between the two, recorded after both.
    const backdated = recordPatchApplication(
      journal,
      { at: QUIT + 2 * DAY, doseMg: 21, site: 'arm-right' },
      NOW,
    )
    if (!backdated.ok) throw new Error('the backdated application should be accepted')

    expect(derive(backdated.journal, NOW).suggestedSite).toBe('chest-right')
  })

  it('takes the one recorded last when two patch applications share the same instant', () => {
    expect(suggestedAt(NOW, applied(QUIT + DAY, 'hip-left'), applied(QUIT + DAY, 'arm-left'))).toBe(
      'arm-right',
    )
  })

  it('ignores a patch application later than now (a clock moved back)', () => {
    expect(
      suggestedAt(QUIT + DAY, applied(QUIT + DAY, 'arm-left'), applied(QUIT + 2 * DAY, 'hip-left')),
    ).toBe('arm-right')
  })
})

describe('derive — the previous application site', () => {
  const QUIT = NOW - 10 * DAY
  const applied = (at: number, site?: ApplicationSite): PatchApplicationFact =>
    site === undefined
      ? { type: 'patch-application', at, doseMg: 21 }
      : { type: 'patch-application', at, doseMg: 21, site }
  const previousAt = (now: number, ...applications: PatchApplicationFact[]) =>
    derive({ ...emptyJournal, facts: [{ type: 'quit-moment', at: QUIT }, ...applications] }, now)
      .previousSite

  it('is none before the first ever patch application', () => {
    expect(previousAt(NOW)).toBeNull()
  })

  it('is the site of the latest patch application in time, not the one recorded last', () => {
    expect(
      previousAt(NOW, applied(QUIT + 3 * DAY, 'chest-left'), applied(QUIT + 2 * DAY, 'arm-right')),
    ).toBe('chest-left')
  })

  it('is none when the previous patch application has no site, even if an earlier one had', () => {
    expect(previousAt(NOW, applied(QUIT + DAY, 'hip-left'), applied(QUIT + 2 * DAY))).toBeNull()
  })

  it('for a day caught up, is the site of the patch application before that day', () => {
    const facts = [applied(QUIT + DAY, 'arm-right'), applied(QUIT + 3 * DAY, 'hip-left')]

    expect(previousAt(QUIT + 2 * DAY, ...facts)).toBe('arm-right')
  })

  it('takes the one recorded last when two patch applications share the same instant', () => {
    expect(previousAt(NOW, applied(QUIT + DAY, 'hip-left'), applied(QUIT + DAY))).toBeNull()
  })

  it('is never the suggested site', () => {
    const facts = [applied(QUIT + DAY, 'arm-left'), applied(QUIT + 2 * DAY, 'hip-right')]
    const state = derive(
      { ...emptyJournal, facts: [{ type: 'quit-moment', at: QUIT }, ...facts] },
      NOW,
    )

    expect(state).toMatchObject({ previousSite: 'hip-right', suggestedSite: 'arm-left' })
  })
})

/** A local wall-clock time; `month` is 1-based. The suite runs in Europe/Paris (vite.config). */
const local = (month: number, day: number, hour = 0, minute = 0, year = 2026) =>
  new Date(year, month - 1, day, hour, minute).getTime()

const journalOf = (quitMoment: number, lapses: readonly number[] = []): Journal => ({
  protocol: defaultProtocol,
  weeklySpendCents: null,
  baselineSmokesPerDay: null,
  goal: null,
  facts: [
    { type: 'quit-moment', at: quitMoment },
    ...lapses.map((at) => ({ type: 'lapse' as const, at, count: 1 })),
  ],
})

// Quit on 1 January at 20:00; the lapses below fall on the following days.
const QUIT = local(1, 1, 20)
const derivedAt = (now: number, lapses: readonly number[]) => derive(journalOf(QUIT, lapses), now)

describe('derive — a slip', () => {
  it('leaves the streak running from the quit moment', () => {
    const now = local(1, 10, 12)

    expect(derivedAt(now, [local(1, 5, 21)]).streak).toEqual({ elapsedMs: now - QUIT })
  })

  it('shows how long since the last cigarette', () => {
    const now = local(1, 10, 12)

    expect(derivedAt(now, [local(1, 5, 21), local(1, 9, 9)]).lastCigarette).toEqual({
      elapsedMs: now - local(1, 9, 9),
    })
  })

  it('shows no last cigarette while there is no lapse', () => {
    expect(derivedAt(local(1, 10), []).lastCigarette).toBeNull()
  })

  it('makes no relapse and no personal best', () => {
    expect(derivedAt(local(1, 10), [local(1, 5, 21)])).toMatchObject({
      relapses: [],
      personalBest: null,
    })
  })

  it('ignores a lapse before the quit moment, left behind by a corrected quit moment', () => {
    const journal: Journal = {
      protocol: defaultProtocol,
      weeklySpendCents: null,
      baselineSmokesPerDay: null,
      goal: null,
      facts: [
        { type: 'quit-moment', at: NOW - 10 * DAY },
        { type: 'lapse', at: NOW - 8 * DAY, count: 1 },
        { type: 'quit-moment', at: NOW - 4 * DAY },
      ],
    }

    expect(derive(journal, NOW)).toMatchObject({
      streak: { elapsedMs: 4 * DAY },
      lastCigarette: null,
      cigarettesSmoked: 0,
    })
  })

  it('ignores a lapse that has not happened yet on a clock moved back', () => {
    const journal = journalOf(NOW - 10 * DAY, [NOW + HOUR])

    expect(derive(journal, NOW)).toMatchObject({
      streak: { elapsedMs: 10 * DAY },
      lastCigarette: null,
    })
  })
})

describe('derive — relapse', () => {
  it('is not reached with two calendar days in a row holding a lapse', () => {
    const now = local(1, 7, 12)

    expect(derivedAt(now, [local(1, 5, 10), local(1, 6, 22)])).toMatchObject({
      relapses: [],
      streak: { elapsedMs: now - QUIT },
    })
  })

  it('restarts the streak from the latest lapse of three days in a row', () => {
    const now = local(1, 7, 12)

    expect(derivedAt(now, [local(1, 5, 10), local(1, 6, 22), local(1, 7, 9)])).toMatchObject({
      relapses: [{ at: local(1, 7, 9) }],
      streak: { elapsedMs: 3 * HOUR },
      lastCigarette: null,
    })
  })

  it('counts a day once however many lapses it holds', () => {
    const lapses = [local(1, 5, 9), local(1, 5, 13), local(1, 5, 23), local(1, 6, 10)]

    expect(derivedAt(local(1, 7, 12), lapses).relapses).toEqual([])
  })

  it('moves the streak again with each further lapse day of the run', () => {
    const lapses = [local(1, 5, 10), local(1, 6, 22), local(1, 7, 9), local(1, 8, 8)]

    expect(derivedAt(local(1, 8, 10), lapses)).toMatchObject({
      relapses: [{ at: local(1, 8, 8) }],
      streak: { elapsedMs: 2 * HOUR },
    })
  })

  it('is broken by a day without a lapse', () => {
    const now = local(1, 9, 12)

    expect(derivedAt(now, [local(1, 5, 10), local(1, 6, 22), local(1, 8, 9)])).toMatchObject({
      relapses: [],
      streak: { elapsedMs: now - QUIT },
    })
  })

  it('counts a lapse at 23:59 then one at 00:01 as two days', () => {
    const twoDays = [local(1, 5, 23, 59), local(1, 6, 0, 1)]

    expect(derivedAt(local(1, 6, 12), twoDays)).toMatchObject({ relapses: [], lapseDaysInARow: 2 })
    expect(derivedAt(local(1, 7, 12), [...twoDays, local(1, 7, 8)]).relapses).toEqual([
      { at: local(1, 7, 8) },
    ])
  })

  it('is created after the fact by a backdated lapse completing a run', () => {
    const now = local(1, 9, 12)
    const before = journalOf(QUIT, [local(1, 5, 10), local(1, 7, 9)])
    const backdated = recordLapse(before, { at: local(1, 6, 22), count: 1 }, now)
    if (!backdated.ok) throw new Error('the backdated lapse should be accepted')

    expect(derive(before, now).relapses).toEqual([])
    expect(derive(backdated.journal, now)).toMatchObject({
      relapses: [{ at: local(1, 7, 9) }],
      streak: { elapsedMs: now - local(1, 7, 9) },
    })
  })

  it('keeps each run apart, the streak counting from the latest', () => {
    const lapses = [
      ...[5, 6, 7].map((day) => local(1, day, 10)),
      ...[15, 16, 17].map((day) => local(1, day, 11)),
    ]

    expect(derivedAt(local(1, 20), lapses)).toMatchObject({
      relapses: [{ at: local(1, 7, 10) }, { at: local(1, 17, 11) }],
      streak: { elapsedMs: local(1, 20) - local(1, 17, 11) },
    })
  })

  it('shows the last cigarette again for a slip after a relapse', () => {
    const lapses = [local(1, 5, 10), local(1, 6, 10), local(1, 7, 10), local(1, 12, 10)]
    const now = local(1, 12, 14)

    expect(derivedAt(now, lapses)).toMatchObject({
      streak: { elapsedMs: now - local(1, 7, 10) },
      lastCigarette: { elapsedMs: 4 * HOUR },
    })
  })

  it('leaves the protocol position exactly where it was', () => {
    const now = local(1, 20)
    const before = derivedAt(now, []).protocol
    const after = derivedAt(
      now,
      [5, 6, 7].map((day) => local(1, day, 10)),
    ).protocol

    expect(after).toEqual(before)
  })
})

describe('derive — lapse days in a row', () => {
  it('counts none while there is no lapse', () => {
    expect(derivedAt(local(1, 10), []).lapseDaysInARow).toBe(0)
  })

  it('counts a lapse today or yesterday: the run is still open', () => {
    expect(derivedAt(local(1, 9, 12), [local(1, 9, 8)]).lapseDaysInARow).toBe(1)
    expect(derivedAt(local(1, 10, 23), [local(1, 9, 8)]).lapseDaysInARow).toBe(1)
  })

  it('counts none once a whole day without a lapse has passed', () => {
    expect(derivedAt(local(1, 11), [local(1, 9, 8)]).lapseDaysInARow).toBe(0)
  })

  it('counts consecutive days up to the latest', () => {
    const lapses = [local(1, 5, 8), local(1, 7, 8), local(1, 8, 8)]

    expect(derivedAt(local(1, 8, 12), lapses).lapseDaysInARow).toBe(2)
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
        { type: 'quit-moment', at: QUIT },
        { type: 'lapse', at: local(1, 5, 10), count: 3 },
        { type: 'lapse', at: local(1, 9, 10), count: 1 },
      ],
    }

    expect(derive(journal, local(1, 10)).cigarettesSmoked).toBe(4)
  })

  it('reads a stored lapse without a count as one cigarette', () => {
    const stored = {
      facts: [
        { type: 'quit-moment', at: QUIT },
        { type: 'lapse', at: local(1, 5, 10) },
      ],
    }

    expect(derive(decodeJournal(stored), local(1, 10)).cigarettesSmoked).toBe(1)
  })
})

describe('derive — personal best', () => {
  const run = (...days: number[]) => days.map((day) => local(1, day, 10))

  it('is hidden while there is no relapse, slips included', () => {
    expect(derivedAt(local(2, 10), []).personalBest).toBeNull()
    expect(derivedAt(local(2, 10), run(5, 6)).personalBest).toBeNull()
  })

  it('is the streak held until the relapse', () => {
    expect(derivedAt(local(1, 9), run(5, 6, 7)).personalBest).toEqual({
      elapsedMs: local(1, 7, 10) - QUIT,
    })
  })

  it('stops growing while the relapse run goes on: each further lapse day restarted the streak', () => {
    expect(derivedAt(local(1, 9, 12), run(5, 6, 7, 8, 9)).personalBest).toEqual({
      elapsedMs: local(1, 7, 10) - QUIT,
    })
  })

  it('is the current streak once it runs longer than every earlier one', () => {
    const now = local(2, 1)

    expect(derivedAt(now, run(3, 4, 5)).personalBest).toEqual({
      elapsedMs: now - local(1, 5, 10),
    })
  })
})

describe('derive — smoke-free days', () => {
  const smokeFreeDays = (quitMoment: number, now: number, lapses: readonly number[] = []) =>
    derive(journalOf(quitMoment, lapses), now).smokeFreeDays

  it('counts nothing from an empty journal', () => {
    expect(derive(emptyJournal, NOW).smokeFreeDays).toBeNull()
  })

  it('counts each whole local day after the quit moment, once it is over', () => {
    // Quit on day 1 at 20:00: day 1 had smoke before the quit moment, day 4 is not over.
    expect(smokeFreeDays(local(1, 1, 20), local(1, 4, 10))).toBe(2)
  })

  it('counts the quit day when the quit moment is its very first instant', () => {
    expect(smokeFreeDays(local(1, 1), local(1, 2))).toBe(1)
    expect(smokeFreeDays(local(1, 1, 0, 1), local(1, 2))).toBe(0)
  })

  it('adds a day exactly at midnight, not a millisecond before', () => {
    const quitMoment = local(1, 1, 20)

    expect(smokeFreeDays(quitMoment, local(1, 4) - 1)).toBe(1)
    expect(smokeFreeDays(quitMoment, local(1, 4))).toBe(2)
  })

  it('does not count day 12 when a lapse happened on it at 23:00', () => {
    const quitMoment = local(1, 1, 20)
    const now = local(1, 20, 10)

    expect(smokeFreeDays(quitMoment, now)).toBe(18)
    expect(smokeFreeDays(quitMoment, now, [local(1, 12, 23)])).toBe(17)
  })

  it('puts a lapse at midnight on the day it opens', () => {
    const quitMoment = local(1, 1, 20)
    const now = local(1, 14)

    // Day 12 stays smoke-free; day 13 does not.
    expect(smokeFreeDays(quitMoment, now, [local(1, 13)])).toBe(11)
    expect(smokeFreeDays(quitMoment, local(1, 13), [local(1, 13)])).toBe(11)
  })

  it('removes a day once however many lapses it holds', () => {
    const lapses = [local(1, 12, 9), local(1, 12, 23)]

    expect(smokeFreeDays(local(1, 1, 20), local(1, 20, 10), lapses)).toBe(17)
  })

  it('takes nothing more away for a lapse on a quit day that never counted', () => {
    expect(smokeFreeDays(local(1, 1, 8), local(1, 5, 10), [local(1, 1, 21)])).toBe(3)
  })

  it('takes the quit day away when it had counted', () => {
    expect(smokeFreeDays(local(1, 1), local(1, 3))).toBe(2)
    expect(smokeFreeDays(local(1, 1), local(1, 3), [local(1, 1, 21)])).toBe(1)
  })

  it('keeps the total when the streak restarts', () => {
    const quitMoment = local(1, 1, 20)
    const now = local(1, 20, 10)

    expect(smokeFreeDays(quitMoment, now, [now - HOUR])).toBe(18)
  })

  it('counts nothing while now is still before the quit moment', () => {
    expect(smokeFreeDays(local(1, 5), local(1, 3))).toBe(0)
  })

  it('follows the calendar across the spring daylight-saving change (23 h day)', () => {
    // 29 March 2026: clocks go from 02:00 to 03:00 in Europe/Paris.
    const quitMoment = local(3, 27, 20)

    expect(smokeFreeDays(quitMoment, local(3, 30))).toBe(2)
    expect(smokeFreeDays(quitMoment, local(3, 31, 10), [local(3, 29, 23, 30)])).toBe(2)
    expect(smokeFreeDays(quitMoment, local(3, 31, 10), [local(3, 30, 0, 30)])).toBe(2)
  })

  it('follows the calendar across the autumn daylight-saving change (25 h day)', () => {
    // 25 October 2026: clocks go from 03:00 back to 02:00 in Europe/Paris.
    const quitMoment = local(10, 23, 20)

    expect(smokeFreeDays(quitMoment, local(10, 26) - 1)).toBe(1)
    expect(smokeFreeDays(quitMoment, local(10, 26))).toBe(2)
    expect(smokeFreeDays(quitMoment, local(10, 27, 10), [local(10, 25, 23, 30)])).toBe(2)
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
