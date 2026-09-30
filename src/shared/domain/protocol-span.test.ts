import type { Fact } from '@quit/contract/facts'
import type { Protocol } from '@quit/contract/settings'
import { local } from '@/shared/test/local-time'
import { factId } from '@/shared/utils/fact-id'
import { derive } from './derive'
import { emptyJournal, type Journal } from './journal'
import { patchCalendar } from './patch-calendar'
import { asksForPatch, protocolSpan } from './protocol-span'
import { scenarios } from './scenarios'

const HOUR = 60 * 60_000
const DAY = 24 * HOUR

// An evening quit: Sunday 20 September, 20:00; three protocol days end on the 23rd at 20:00.
const QUIT = local(9, 20, 20)
const SHORT: Protocol = [{ doseMg: 7, durationDays: 3 }]

describe('protocolSpan', () => {
  it('opens on the day holding the quit moment and closes on the day the last step ends', () => {
    expect(protocolSpan(SHORT, QUIT)).toEqual({ quitDay: local(9, 20), endDay: local(9, 23) })
  })

  it('closes on the day the planned end falls on across the autumn daylight-saving change', () => {
    // 25 October 2026 lasts 25 h: seven 24 h blocks from 00:30 on the 20th end at 23:30 on the 26th.
    const week: Protocol = [{ doseMg: 7, durationDays: 7 }]

    expect(protocolSpan(week, local(10, 20, 0, 30)).endDay).toBe(local(10, 26))
  })
})

describe('asksForPatch', () => {
  const span = protocolSpan(SHORT, QUIT)

  it('asks nothing on the quit day: a patch put on before the quit moment cannot be recorded', () => {
    expect(asksForPatch(local(9, 20), span)).toBe(false)
  })

  it('asks for one patch on each day between the quit day and the end day', () => {
    expect(asksForPatch(local(9, 21), span)).toBe(true)
    expect(asksForPatch(local(9, 22), span)).toBe(true)
  })

  it('asks nothing from the end day on: the last patch comes off', () => {
    expect(asksForPatch(local(9, 23), span)).toBe(false)
    expect(asksForPatch(local(9, 30), span)).toBe(false)
  })
})

// The calendar and the home's patch of the day both ask `asksForPatch`: they agree on today.
describe('today’s patch agrees with the calendar', () => {
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
    const facts: Fact[] = [{ type: 'quit-moment', id: factId(1), at: quitMoment }]
    // A patch at 08:00 every day but every third, and one on the end day.
    for (let day = 1; day <= 10; day += 1)
      if (day % 3 !== 0)
        facts.push({
          type: 'patch-application',
          id: factId(day + 1),
          at: new Date(2026, 8, 20 + day, 8).getTime(),
          doseMg: 7,
        })
    const journal: Journal = { ...emptyJournal, protocol: [{ doseMg: 7, durationDays: 8 }], facts }

    for (let at = quitMoment - DAY; at < quitMoment + 12 * DAY; at += HOUR)
      expect(homeSays(journal, at), new Date(at).toString()).toBe(calendarSays(journal, at))
  })
})
