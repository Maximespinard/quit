import { DAY_MS } from '@/shared/utils/duration'
import type { Fact } from './facts/registry'
import { emptyJournal, type Journal } from './journal'
import { type CalendarDay, patchCalendar } from './patch-calendar'
import { defaultProtocol, type Protocol, setProtocol } from './protocol'
import { scenarioById } from './scenarios'

// Vitest pins TZ to Europe/Paris: the calendar days below are Paris days.
const local = (month: number, day: number, hour = 0, minute = 0) =>
  new Date(2026, month - 1, day, hour, minute).getTime()

/** Thursday 1 January 2026, 13:00. */
const QUIT = local(1, 1, 13)

const journalOf = (
  quitMoment: number,
  facts: readonly Fact[] = [],
  protocol: Protocol = defaultProtocol,
): Journal => ({
  ...emptyJournal,
  protocol,
  facts: [{ type: 'quit-moment', at: quitMoment }, ...facts],
})

const patch = (at: number, doseMg = 21): Fact => ({ type: 'patch-application', at, doseMg })
const lapse = (at: number, count = 1): Fact => ({ type: 'lapse', at, count })
const craving = (at: number): Fact => ({
  type: 'craving',
  at,
  intensity: 2,
  heldToEnd: true,
  tags: [],
})

function calendarOf(journal: Journal, now: number) {
  const calendar = patchCalendar(journal, now)
  if (calendar === null) throw new Error('No calendar without a quit moment')
  return calendar
}

/** The calendar day opening at local midnight `day`. */
function dayOf(days: readonly CalendarDay[], day: number): CalendarDay {
  const found = days.find((candidate) => candidate.day === day)
  if (found === undefined) throw new Error(`No calendar day at ${new Date(day).toString()}`)
  return found
}

describe('patchCalendar', () => {
  it('has nothing to show without a quit moment', () => {
    expect(patchCalendar(emptyJournal, QUIT)).toBeNull()
  })

  it('lays each step over its calendar days, with the next step change and the planned end', () => {
    const calendar = calendarOf(journalOf(QUIT), local(1, 4, 10))

    expect(calendar.steps).toEqual([
      {
        number: 1,
        step: { doseMg: 21, durationDays: 28 },
        startsAt: QUIT,
        endsAt: local(1, 29, 13),
        firstDay: local(1, 1),
        lastDay: local(1, 28),
      },
      {
        number: 2,
        step: { doseMg: 14, durationDays: 28 },
        startsAt: local(1, 29, 13),
        endsAt: local(2, 26, 13),
        firstDay: local(1, 29),
        lastDay: local(2, 25),
      },
      {
        number: 3,
        step: { doseMg: 7, durationDays: 28 },
        startsAt: local(2, 26, 13),
        endsAt: local(3, 26, 13),
        firstDay: local(2, 26),
        lastDay: local(3, 25),
      },
    ])
    expect(calendar.nextStepChange).toBe(local(1, 29, 13))
    expect(calendar.plannedEnd).toBe(local(3, 26, 13))
    expect(calendar.position).toMatchObject({ status: 'running', stepNumber: 1, dayInStep: 3 })
  })

  it('runs from the quit day to the planned end, every day tagged with its step', () => {
    const { days } = calendarOf(journalOf(QUIT), local(1, 4, 10))

    expect(days[0]?.day).toBe(local(1, 1))
    expect(days.at(-1)?.day).toBe(local(3, 26))
    expect(days).toHaveLength(85)
    expect(dayOf(days, local(1, 28))).toMatchObject({ step: 1, stepStart: false })
    expect(dayOf(days, local(1, 29))).toMatchObject({ step: 2, stepStart: true })
    // The end day holds no patch to put on: the last one comes off there.
    expect(dayOf(days, local(3, 26))).toMatchObject({ step: null, patch: null, end: true })
    expect(days.filter((day) => day.end)).toHaveLength(1)
    expect(days.filter((day) => day.today).map((day) => day.day)).toEqual([local(1, 4)])
  })

  it('tells logged, missing, due and planned patch applications apart', () => {
    const journal = journalOf(QUIT, [patch(local(1, 1, 13, 5)), patch(local(1, 3, 13, 30))])
    const { days } = calendarOf(journal, local(1, 4, 14))

    expect(dayOf(days, local(1, 1)).patch).toBe('logged')
    expect(dayOf(days, local(1, 2)).patch).toBe('missing')
    expect(dayOf(days, local(1, 3)).patch).toBe('logged')
    // Its protocol day began at 13:00 and runs until tomorrow 13:00: still time.
    expect(dayOf(days, local(1, 4)).patch).toBe('due')
    expect(dayOf(days, local(1, 5)).patch).toBe('planned')
  })

  it('counts a patch put on after midnight for the protocol day begun the evening before', () => {
    const quitMoment = local(1, 31, 23)
    const journal = journalOf(quitMoment, [patch(local(2, 1, 0, 30))])
    const { days } = calendarOf(journal, local(2, 2, 12))

    expect(dayOf(days, local(1, 31)).patch).toBe('logged')
    expect(dayOf(days, local(2, 1)).patch).toBe('due')
  })

  it('crosses month boundaries day by day, each fact on its own local day', () => {
    const quitMoment = local(1, 30, 9)
    const journal = journalOf(quitMoment, [
      lapse(local(1, 31, 23, 59), 2),
      craving(local(2, 1, 0, 1)),
      craving(local(2, 1, 18)),
    ])
    const { days } = calendarOf(journal, local(2, 3, 12))

    expect(days.slice(0, 4).map((day) => day.day)).toEqual([
      local(1, 30),
      local(1, 31),
      local(2, 1),
      local(2, 2),
    ])
    expect(dayOf(days, local(1, 31))).toMatchObject({ cigarettes: 2, cravings: 0 })
    expect(dayOf(days, local(2, 1))).toMatchObject({ cigarettes: 0, cravings: 2 })
  })

  it('puts lapses and cravings on their local calendar day, never one not yet happened', () => {
    const journal = journalOf(QUIT, [
      lapse(local(1, 2, 22)),
      lapse(local(1, 2, 23, 30), 3),
      craving(local(1, 3, 8)),
      craving(local(1, 4, 16)),
      lapse(local(1, 4, 17)),
    ])
    const { days } = calendarOf(journal, local(1, 4, 14))

    expect(dayOf(days, local(1, 2))).toMatchObject({ cigarettes: 4, cravings: 0 })
    expect(dayOf(days, local(1, 3))).toMatchObject({ cigarettes: 0, cravings: 1 })
    expect(dayOf(days, local(1, 4))).toMatchObject({ cigarettes: 0, cravings: 0 })
  })

  it('leaves out facts older than a corrected quit moment', () => {
    const journal = journalOf(QUIT, [
      patch(local(1, 1, 13, 5)),
      craving(local(1, 1, 14)),
      { type: 'quit-moment', at: local(1, 1, 20) },
    ])
    const { days } = calendarOf(journal, local(1, 3, 10))

    expect(dayOf(days, local(1, 1))).toMatchObject({ patch: 'missing', cravings: 0 })
  })

  it('does not ask for a patch after the protocol, and runs on to today', () => {
    const protocol: Protocol = [{ doseMg: 7, durationDays: 2 }]
    const journal = journalOf(QUIT, [patch(local(1, 1, 14), 7)], protocol)
    const calendar = calendarOf(journal, local(1, 6, 10))

    expect(calendar.position).toEqual({ status: 'over' })
    expect(calendar.nextStepChange).toBeNull()
    expect(calendar.days.map((day) => [day.patch, day.step])).toEqual([
      ['logged', 1],
      ['missing', 1],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
    ])
    expect(calendar.days.at(-1)).toMatchObject({ day: local(1, 6), today: true })
  })

  it('has no next step change on the last step', () => {
    const protocol: Protocol = [
      { doseMg: 14, durationDays: 2 },
      { doseMg: 7, durationDays: 5 },
    ]

    expect(calendarOf(journalOf(QUIT, [], protocol), local(1, 4, 10)).nextStepChange).toBeNull()
  })

  it('follows a protocol edited mid-step, past patch applications kept on their days', () => {
    const journal = journalOf(QUIT, [patch(local(1, 1, 13, 5)), patch(local(1, 2, 13, 5))])
    const edited = setProtocol(journal, [
      { doseMg: 21, durationDays: 21 },
      { doseMg: 10, durationDays: 14 },
    ])
    if (!edited.ok) throw new Error('The edit was refused')
    const calendar = calendarOf(edited.journal, local(1, 10, 10))

    expect(calendar.nextStepChange).toBe(local(1, 22, 13))
    expect(calendar.plannedEnd).toBe(local(2, 5, 13))
    expect(calendar.steps.map((step) => [step.firstDay, step.lastDay])).toEqual([
      [local(1, 1), local(1, 21)],
      [local(1, 22), local(2, 4)],
    ])
    expect(dayOf(calendar.days, local(1, 22))).toMatchObject({ step: 2, stepStart: true })
    expect(calendar.days.at(-1)).toMatchObject({ day: local(2, 5), end: true })
    expect(dayOf(calendar.days, local(1, 2)).patch).toBe('logged')
    expect(dayOf(calendar.days, local(1, 3)).patch).toBe('missing')
  })

  it('places a backdated fact on its own day, wherever it sits in the journal', () => {
    const journal = journalOf(QUIT, [
      patch(local(1, 5, 13, 5)),
      lapse(local(1, 5, 20)),
      // Recorded last, backdated to the second protocol day.
      patch(local(1, 2, 21)),
      craving(local(1, 2, 21, 30)),
    ])
    const { days } = calendarOf(journal, local(1, 6, 10))

    expect(dayOf(days, local(1, 2))).toMatchObject({ patch: 'logged', cravings: 1 })
    expect(dayOf(days, local(1, 5))).toMatchObject({ patch: 'logged', cigarettes: 1 })
  })

  it('does not count a patch application later than now (a clock moved back)', () => {
    const journal = journalOf(QUIT, [patch(local(1, 3, 13, 5))])
    const { days } = calendarOf(journal, local(1, 3, 13))

    expect(dayOf(days, local(1, 3)).patch).toBe('due')
  })

  it('keeps every day whole across the spring daylight-saving change (23 h day)', () => {
    // 29 March 2026: clocks go from 02:00 to 03:00 in Europe/Paris. The 20:00 protocol
    // days start at 21:00 from then on, and the step change lands on the right date.
    const quitMoment = local(3, 1, 20)
    const journal = journalOf(quitMoment, [patch(local(3, 29, 21, 5)), craving(local(3, 29, 23))])
    const calendar = calendarOf(journal, local(3, 31, 10))

    expect(calendar.steps[1]).toMatchObject({ startsAt: local(3, 29, 21), firstDay: local(3, 29) })
    expect(calendar.days.slice(27, 31).map((day) => day.day)).toEqual([
      local(3, 28),
      local(3, 29),
      local(3, 30),
      local(3, 31),
    ])
    expect(dayOf(calendar.days, local(3, 29))).toMatchObject({
      step: 2,
      stepStart: true,
      patch: 'logged',
      cravings: 1,
    })
    expect(dayOf(calendar.days, local(3, 30)).patch).toBe('due')
  })

  it('asks no patch on a spring day no protocol day starts in', () => {
    // Protocol days start at 23:30 in winter time, so at 00:30 once summer time begins:
    // none starts on 29 March, which still belongs to the step in force.
    const quitMoment = local(3, 27, 23, 30)
    const { days } = calendarOf(journalOf(quitMoment), local(4, 2, 10))

    expect(dayOf(days, local(3, 28)).patch).toBe('missing')
    expect(dayOf(days, local(3, 29))).toMatchObject({ step: 1, patch: null })
    expect(dayOf(days, local(3, 30)).patch).toBe('missing')
    expect(new Set(days.map((day) => day.day)).size).toBe(days.length)
  })

  it('merges the two protocol days an autumn day can hold (25 h day)', () => {
    // 25 October 2026: clocks go from 03:00 back to 02:00. Protocol days start at 00:30 in
    // summer time, so at 23:30 once winter time begins: 25 October holds two of them.
    const quitMoment = local(10, 23, 0, 30)
    const both = [patch(local(10, 25, 0, 45)), patch(local(10, 25, 23, 45))]
    const one = [patch(local(10, 25, 0, 45))]

    expect(
      dayOf(calendarOf(journalOf(quitMoment, both), local(10, 28)).days, local(10, 25)).patch,
    ).toBe('logged')
    expect(
      dayOf(calendarOf(journalOf(quitMoment, one), local(10, 28)).days, local(10, 25)).patch,
    ).toBe('missing')
  })

  it('waits on planned days when now sits before the quit moment (a moved sandbox clock)', () => {
    const { days } = calendarOf(journalOf(QUIT), QUIT - DAY_MS)

    expect(days[0]).toMatchObject({ day: local(1, 1), step: 1, patch: 'planned', today: false })
    expect(days.some((day) => day.today)).toBe(false)
  })

  it('shows the day-45 scenario: a slip last night, every patch put on', () => {
    const { journal, now } = scenarioById('day-45-lapse')
    const { days } = calendarOf(journal, now)

    // Tuesday 16 June: the slip at 22:40.
    expect(dayOf(days, local(6, 16))).toMatchObject({ cigarettes: 1, cravings: 1 })
    expect(days.filter((day) => day.patch === 'missing')).toEqual([])
    expect(dayOf(days, local(6, 17))).toMatchObject({ today: true, patch: 'logged', step: 2 })
  })
})
