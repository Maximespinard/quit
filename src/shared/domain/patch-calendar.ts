import { CRAVING, PATCH_APPLICATION } from '@quit/contract/facts'
import type { Step } from '@quit/contract/settings'
import { DAY_MS } from '@/shared/utils/duration'
import { lapsesUntil } from './facts/lapse'
import { latestQuitMoment } from './facts/quit-moment'
import type { Journal } from './journal'
import { localMidnight } from './local-day'
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
  /** Local midnight of the calendar day it begins on. */
  readonly firstDay: number
  /** Local midnight of its last calendar day: the next step begins the day after. */
  readonly lastDay: number
}

/**
 * Whether a patch application was put on during a calendar day of the protocol: `due` while
 * the day, today, still has none; `planned` for a day still to come.
 */
export type DayPatch = 'logged' | 'missing' | 'due' | 'planned'

export type CalendarDay = {
  /** Local midnight opening the day. */
  readonly day: number
  /** The number of the step the day belongs to; `null` from the end day on. */
  readonly step: number | null
  /** The step beginning on this day, if one does. */
  readonly startingStep: Step | null
  /**
   * On the quit day and from the end day on, only a patch application actually put on
   * shows: none is asked for.
   */
  readonly patch: DayPatch | null
  /** Every lapse's cigarettes that day. */
  readonly cigarettes: number
  readonly cravings: number
  readonly isToday: boolean
  /** The protocol ends on this day: the last patch comes off. */
  readonly isEnd: boolean
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

/** What one calendar day holds, facts only. */
type DayFacts = { patches: number; cigarettes: number; cravings: number }

function stepsOver(journal: Journal, quitMoment: number): CalendarStep[] {
  const steps: CalendarStep[] = []
  let startsAt = quitMoment
  for (const [index, step] of journal.protocol.entries()) {
    const endsAt = startsAt + step.durationDays * DAY_MS
    steps.push({
      number: index + 1,
      step,
      startsAt,
      endsAt,
      firstDay: localMidnight(startsAt),
      lastDay: localMidnight(endsAt, -1),
    })
    startsAt = endsAt
  }
  return steps
}

/** A protocol day of the calendar without a patch application: over, today, or to come. */
function patchStillAsked(day: number, now: number): DayPatch {
  if (localMidnight(day, 1) <= now) return 'missing'
  return day <= now ? 'due' : 'planned'
}

/**
 * The protocol laid over the calendar, from `(journal, now)` alone. Each step spans the
 * calendar days from the one its first protocol day begins on. Patch applications, lapses
 * and cravings sit on the local calendar day they happened on: a patch put on at 08:00 shows
 * on that day whatever the quit moment's time — the calendar answers "did I put one on that
 * day", where the home's patch of the day follows the protocol day. Days are walked on the
 * calendar, never in 24 h blocks, so a daylight-saving change keeps each day whole. Facts
 * before the quit moment or after `now` are left out. `null` without a quit moment.
 */
export function patchCalendar(journal: Journal, now: number): PatchCalendar | null {
  const quitMoment = latestQuitMoment(journal)
  if (quitMoment === null) return null

  const steps = stepsOver(journal, quitMoment)
  const plannedEnd = steps.at(-1)?.endsAt ?? quitMoment

  const facts = new Map<number, DayFacts>()
  const factsOn = (at: number) => {
    const day = localMidnight(at)
    const found = facts.get(day) ?? { patches: 0, cigarettes: 0, cravings: 0 }
    facts.set(day, found)
    return found
  }
  for (const fact of journal.facts) {
    if (fact.at < quitMoment || fact.at > now) continue
    if (fact.type === PATCH_APPLICATION) factsOn(fact.at).patches += 1
    else if (fact.type === CRAVING) factsOn(fact.at).cravings += 1
  }
  for (const lapse of lapsesUntil(journal, quitMoment, now))
    factsOn(lapse.at).cigarettes += lapse.count

  const today = localMidnight(now)
  const quitDay = localMidnight(quitMoment)
  const endDay = localMidnight(plannedEnd)
  const days: CalendarDay[] = []
  for (let day = quitDay; day <= Math.max(endDay, today); day = localMidnight(day, 1)) {
    const { patches = 0, cigarettes = 0, cravings = 0 } = facts.get(day) ?? {}
    const inProtocol = day < endDay
    const step = inProtocol ? steps.findLast((candidate) => candidate.firstDay <= day) : undefined
    days.push({
      day,
      step: step?.number ?? null,
      startingStep: step?.firstDay === day ? step.step : null,
      // The quit day asks for none: a patch put on before the quit moment cannot be recorded.
      patch:
        patches > 0 ? 'logged' : inProtocol && day !== quitDay ? patchStillAsked(day, now) : null,
      cigarettes,
      cravings,
      isToday: day === today,
      isEnd: day === endDay,
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
