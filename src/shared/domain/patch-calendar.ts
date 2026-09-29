import { DAY_MS } from '@/shared/utils/duration'
import { CRAVING } from './facts/craving'
import { lapsesUntil } from './facts/lapse'
import { PATCH_APPLICATION } from './facts/patch-application'
import { latestQuitMoment } from './facts/quit-moment'
import type { Journal } from './journal'
import { localMidnight } from './local-day'
import type { Step } from './protocol'
import { type ProtocolPosition, protocolPosition } from './protocol-position'

/** One step of the protocol laid over the calendar. */
export type CalendarStep = {
  /** 1-based, like the copy shows it. */
  readonly number: number
  readonly step: Step
  /** The instant its first protocol day begins. */
  readonly startsAt: number
  /** The instant it ends: the next step, or the end of the protocol, begins there. */
  readonly endsAt: number
  /** Local midnight of the calendar day its first protocol day begins on. */
  readonly firstDay: number
  /** Local midnight of the calendar day its last protocol day begins on. */
  readonly lastDay: number
}

/**
 * The patch application a calendar day asks for: the one of the protocol day beginning on it.
 * `due` while that protocol day still runs; `planned` before it has begun.
 */
export type DayPatch = 'logged' | 'missing' | 'due' | 'planned'

export type CalendarDay = {
  /** Local midnight opening the day. */
  readonly day: number
  /** The step in force when the day ends; `null` once the protocol is over. */
  readonly step: number | null
  /** A step begins on this day. */
  readonly stepStart: boolean
  /** `null` when no protocol day begins on this day: after the protocol, or a spring DST gap. */
  readonly patch: DayPatch | null
  /** Every lapse's cigarettes that day. */
  readonly cigarettes: number
  readonly cravings: number
  readonly today: boolean
  /** The protocol ends on this day: the last patch comes off. */
  readonly end: boolean
}

export type PatchCalendar = {
  readonly position: ProtocolPosition
  readonly steps: readonly CalendarStep[]
  /** When the running step hands over to the next one; `null` on the last step or after it. */
  readonly nextStepChange: number | null
  /** The instant the last step ends. */
  readonly plannedEnd: number
  /** Every calendar day from the quit day to the planned end, or to today once past it. */
  readonly days: readonly CalendarDay[]
}

type DayMarks = { cigarettes: number; cravings: number }

/** Which protocol day `at` falls in, 0 for the first; negative before the quit moment. */
const protocolDayOf = (quitMoment: number, at: number) => Math.floor((at - quitMoment) / DAY_MS)

/** The patch application a day asks for when several protocol days begin on it: the worst. */
const PATCH_PRIORITY: readonly DayPatch[] = ['missing', 'due', 'planned', 'logged']

/**
 * The protocol laid over the calendar, from `(journal, now)` alone. The patch applications
 * follow protocol days — the 24 h blocks from the quit moment — each shown on the calendar
 * day it begins on; lapses and cravings sit on their own local calendar day. Days are walked
 * on the calendar, never in 24 h blocks, so a daylight-saving change keeps each day whole.
 * Facts before the quit moment or after `now` are left out. `null` without a quit moment.
 */
export function patchCalendar(journal: Journal, now: number): PatchCalendar | null {
  const quitMoment = latestQuitMoment(journal)
  if (quitMoment === null) return null

  const steps: CalendarStep[] = []
  /** The step number of each protocol day, in order. */
  const stepOfProtocolDay: number[] = []
  for (const [index, step] of journal.protocol.entries()) {
    const firstIndex = stepOfProtocolDay.length
    const startsAt = quitMoment + firstIndex * DAY_MS
    const endsAt = startsAt + step.durationDays * DAY_MS
    steps.push({
      number: index + 1,
      step,
      startsAt,
      endsAt,
      firstDay: localMidnight(startsAt),
      lastDay: localMidnight(endsAt - DAY_MS),
    })
    for (let day = 0; day < step.durationDays; day += 1) stepOfProtocolDay.push(index + 1)
  }
  const protocolDays = stepOfProtocolDay.length
  const plannedEnd = quitMoment + protocolDays * DAY_MS

  const counts = (at: number) => at >= quitMoment && at <= now
  const loggedProtocolDays = new Set<number>()
  const marks = new Map<number, DayMarks>()
  const marksOn = (at: number) => {
    const day = localMidnight(at)
    const found = marks.get(day) ?? { cigarettes: 0, cravings: 0 }
    marks.set(day, found)
    return found
  }
  for (const fact of journal.facts) {
    if (!counts(fact.at)) continue
    if (fact.type === PATCH_APPLICATION) loggedProtocolDays.add(protocolDayOf(quitMoment, fact.at))
    else if (fact.type === CRAVING) marksOn(fact.at).cravings += 1
  }
  for (const lapse of lapsesUntil(journal, quitMoment, now))
    marksOn(lapse.at).cigarettes += lapse.count

  const patchOf = (index: number): DayPatch => {
    const startsAt = quitMoment + index * DAY_MS
    if (loggedProtocolDays.has(index)) return 'logged'
    if (startsAt + DAY_MS <= now) return 'missing'
    return startsAt <= now ? 'due' : 'planned'
  }

  const today = localMidnight(now)
  const endDay = localMidnight(plannedEnd)
  const lastDay = Math.max(endDay, today)
  const days: CalendarDay[] = []
  for (let day = localMidnight(quitMoment); day <= lastDay; day = localMidnight(day, 1)) {
    const next = localMidnight(day, 1)
    // The protocol days beginning in [day, next): one, but none or two around a DST change.
    const beginning: number[] = []
    const from = Math.max(0, Math.ceil((day - quitMoment) / DAY_MS))
    const to = Math.min(protocolDays, Math.ceil((next - quitMoment) / DAY_MS))
    for (let index = from; index < to; index += 1) beginning.push(index)
    const patches = beginning.map(patchOf)
    const { cigarettes = 0, cravings = 0 } = marks.get(day) ?? {}
    days.push({
      day,
      step: stepOfProtocolDay[protocolDayOf(quitMoment, next - 1)] ?? null,
      stepStart: beginning.some(
        (index) => index === 0 || stepOfProtocolDay[index] !== stepOfProtocolDay[index - 1],
      ),
      patch: PATCH_PRIORITY.find((patch) => patches.includes(patch)) ?? null,
      cigarettes,
      cravings,
      today: day === today,
      end: day === endDay,
    })
  }

  const position = protocolPosition(journal.protocol, quitMoment, now)
  return {
    position,
    steps,
    nextStepChange:
      position.status === 'running' && position.nextStep !== null ? position.endsAt : null,
    plannedEnd,
    days,
  }
}
