import { derive } from './derive'
import { recordPatchApplication } from './facts/patch-application'
import { emptyJournal, type Journal } from './journal'
import { defaultProtocol, type Protocol, setProtocol } from './protocol'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const NOW = Date.UTC(2026, 8, 22, 10, 0, 0)

const journalWithQuitMoment = (at: number, protocol: Protocol = defaultProtocol): Journal => ({
  facts: [{ type: 'quit-moment', at }],
  protocol,
})

describe('derive', () => {
  it('derives nothing from an empty journal', () => {
    expect(derive(emptyJournal, NOW)).toEqual({
      quitMoment: null,
      streak: null,
      protocol: null,
      patch: null,
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
      nextStep: { doseMg: 14, durationDays: 14 },
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

describe('derive — the patch application of the protocol day', () => {
  // Derived from the default taper, so the end of it follows the durations wherever they come from.
  const PROTOCOL_DAYS = defaultProtocol.reduce((days, step) => days + step.durationDays, 0)
  // A protocol day is a 24 h block from the quit moment (18:00 here), not a calendar day.
  const local = (day: number, hour: number, minute = 0) =>
    new Date(2026, 8, day, hour, minute).getTime()
  const QUIT = local(20, 18)
  const applied = (at: number, doseMg = 21) => ({ type: 'patch-application', at, doseMg }) as const
  const patchAt = (now: number, ...applications: ReturnType<typeof applied>[]) =>
    derive(
      { facts: [{ type: 'quit-moment', at: QUIT }, ...applications], protocol: defaultProtocol },
      now,
    ).patch

  it('is due with the current step’s dose while nothing is logged this protocol day', () => {
    expect(patchAt(local(22, 9))).toEqual({ status: 'due', doseMg: 21 })
  })

  it('is logged once a patch application is recorded this protocol day, with its time and dose', () => {
    expect(patchAt(local(22, 9), applied(local(22, 8, 15), 14))).toEqual({
      status: 'logged',
      at: local(22, 8, 15),
      doseMg: 14,
    })
  })

  it('counts a patch application put on the minute the protocol day begins', () => {
    expect(patchAt(local(22, 17, 59), applied(local(21, 18)))).toMatchObject({ status: 'logged' })
  })

  it('does not count one put on a minute before the protocol day began', () => {
    expect(patchAt(local(21, 18), applied(local(21, 17, 59)))).toEqual({
      status: 'due',
      doseMg: 21,
    })
  })

  it('stays logged across midnight and resets when the protocol day ends', () => {
    const application = applied(local(21, 19))

    expect(patchAt(local(22, 0, 30), application)).toMatchObject({ status: 'logged' })
    expect(patchAt(local(22, 17, 59), application)).toMatchObject({ status: 'logged' })
    expect(patchAt(local(22, 18), application)).toMatchObject({ status: 'due' })
  })

  it('counts a patch application backdated to earlier in the protocol day', () => {
    const journal = {
      facts: [{ type: 'quit-moment', at: QUIT } as const],
      protocol: defaultProtocol,
    }
    const now = local(22, 10)
    const backdated = recordPatchApplication(journal, { at: local(21, 20), doseMg: 21 }, now)
    if (!backdated.ok) throw new Error('the backdated application should be accepted')

    expect(derive(backdated.journal, now).patch).toEqual({
      status: 'logged',
      at: local(21, 20),
      doseMg: 21,
    })
  })

  it('leaves the protocol day due when the backdated patch application is for the one before', () => {
    expect(patchAt(local(22, 10), applied(local(21, 7)))).toMatchObject({ status: 'due' })
  })

  it('shows the latest of several patch applications logged this protocol day', () => {
    expect(patchAt(local(22, 17), applied(local(22, 12), 14), applied(local(21, 19)))).toEqual({
      status: 'logged',
      at: local(22, 12),
      doseMg: 14,
    })
  })

  it('shows the one recorded last when two patch applications share the same instant', () => {
    expect(patchAt(local(22, 17), applied(local(22, 12)), applied(local(22, 12), 14))).toEqual({
      status: 'logged',
      at: local(22, 12),
      doseMg: 14,
    })
  })

  it('ignores a patch application later than now (a clock moved back)', () => {
    expect(patchAt(local(22, 9), applied(local(22, 10)))).toMatchObject({ status: 'due' })
  })

  it('counts protocol days from a quit moment corrected later', () => {
    const journal = {
      facts: [
        { type: 'quit-moment', at: QUIT } as const,
        applied(local(22, 8)),
        { type: 'quit-moment', at: local(22, 12) } as const,
      ],
      protocol: defaultProtocol,
    }

    expect(derive(journal, local(22, 20)).patch).toEqual({ status: 'due', doseMg: 21 })
  })

  it('prefills the dose of the step now running', () => {
    expect(patchAt(QUIT + 30 * DAY)).toEqual({ status: 'due', doseMg: 14 })
  })

  it('asks for no extra patch on the last morning, while the last protocol day still runs', () => {
    const lastDay = QUIT + (PROTOCOL_DAYS - 1) * DAY

    expect(patchAt(lastDay + 16 * HOUR, applied(lastDay + HOUR, 7))).toEqual({
      status: 'logged',
      at: lastDay + HOUR,
      doseMg: 7,
    })
  })

  it('requests no patch application once the protocol is over', () => {
    expect(patchAt(QUIT + PROTOCOL_DAYS * DAY)).toEqual({ status: 'over' })
    expect(
      patchAt(QUIT + PROTOCOL_DAYS * DAY, applied(QUIT + PROTOCOL_DAYS * DAY - HOUR, 7)),
    ).toEqual({
      status: 'over',
    })
  })
})
