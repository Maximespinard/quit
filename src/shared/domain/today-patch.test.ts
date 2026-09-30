import type { PatchApplicationFact } from '@quit/contract/facts'
import type { Protocol } from '@quit/contract/settings'
import { factIdSequence } from '@/shared/test/fact-ids'
import { factId } from '@/shared/utils/fact-id'
import { recordPatchApplication } from './facts/patch-application'
import { emptyJournal, type Journal } from './journal'
import { defaultProtocol } from './protocol'
import { protocolPosition } from './protocol-position'
import { todayPatch } from './today-patch'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// Today is the local calendar day holding `now`, wherever the quit moment sits in it.
const local = (month: number, day: number, hour: number, minute = 0) =>
  new Date(2026, month - 1, day, hour, minute).getTime()
// An evening quit: Sunday 20 September, 20:00.
const QUIT = local(9, 20, 20)
// Quit moments take ids 1 and 2; patch applications count up from 10.
const nextId = factIdSequence(10)
const applied = (at: number, doseMg = 21): PatchApplicationFact => ({
  type: 'patch-application',
  id: nextId(),
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
  facts: [{ type: 'quit-moment', id: factId(1), at: quitMoment }, ...facts],
})
/** Today's patch at `now`, the protocol position taken from the same quit moment. */
const patchOf = (journal: Journal, now: number, quitMoment = QUIT) =>
  todayPatch(journal, quitMoment, protocolPosition(journal.protocol, quitMoment, now), now)
const patchAt = (now: number, ...applications: PatchApplicationFact[]) =>
  patchOf(journalOf(applications), now)

describe('todayPatch', () => {
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
      { id: factId(10), at: local(9, 22, 7), doseMg: 21 },
      now,
    )
    if (!backdated.ok) throw new Error('the backdated application should be accepted')

    expect(patchOf(backdated.journal, now)).toEqual({
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
    const corrected = local(9, 22, 12)
    const journal: Journal = {
      ...emptyJournal,
      facts: [
        { type: 'quit-moment', id: factId(1), at: QUIT },
        applied(local(9, 22, 8)),
        { type: 'quit-moment', id: factId(2), at: corrected },
      ],
    }

    expect(patchOf(journal, local(9, 22, 20), corrected)).toEqual({
      status: 'offered',
      doseMg: 21,
    })
  })

  it('prefills the dose of the step now running', () => {
    expect(patchAt(QUIT + 30 * DAY)).toEqual({ status: 'due', doseMg: 14 })
  })

  describe('at the end of the protocol', () => {
    // Three protocol days: the protocol ends on Wednesday 23 September at 20:00.
    const SHORT: Protocol = [{ doseMg: 7, durationDays: 3 }]
    const shortAt = (now: number, ...applications: PatchApplicationFact[]) =>
      patchOf(journalOf(applications, SHORT), now)

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
      const statuses: string[] = []
      for (let now = midnight; now < nextMidnight; now += MINUTES_30)
        statuses.push(patchOf(journal, now, quitMoment).status)
      return { statuses, nextDay: patchOf(journal, nextMidnight, quitMoment) }
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
