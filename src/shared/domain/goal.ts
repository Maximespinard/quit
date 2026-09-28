import { latestQuitMoment } from './facts/quit-moment'
import type { Journal } from './journal'
import { goalProgress } from './savings'

/** The one thing the user is saving towards. Its progress is derived, never stored. */
export type Goal = {
  readonly label: string
  /** Integer cents, above zero. */
  readonly priceCents: number
  /**
   * Where its money saved starts counting: `null` for the quit moment, or the instant it
   * replaced a goal reached — that money went on the previous one.
   */
  readonly countsFrom: number | null
  /**
   * Set once the celebration of the goal reached has been seen: it plays only once, and the
   * goal stays reached from then on.
   */
  readonly celebrated: boolean
}

export const GOAL_LABEL_MAX_LENGTH = 60

const isValidLabel = (label: string) => label.length > 0 && label.length <= GOAL_LABEL_MAX_LENGTH

const isValidPrice = (cents: number) => Number.isInteger(cents) && cents > 0

/** Turns a stored value back into a goal, or `null` when it is not one. */
export function decodeGoal(raw: unknown): Goal | null {
  if (typeof raw !== 'object' || raw === null) return null
  const {
    label,
    priceCents,
    countsFrom = null,
    celebrated = false,
  } = raw as Record<string, unknown>
  if (typeof label !== 'string' || !isValidLabel(label.trim())) return null
  if (typeof priceCents !== 'number' || !isValidPrice(priceCents)) return null
  if (countsFrom !== null && (typeof countsFrom !== 'number' || !Number.isFinite(countsFrom)))
    return null
  if (typeof celebrated !== 'boolean') return null
  return { label: label.trim(), priceCents, countsFrom, celebrated }
}

export type SetGoalResult =
  | { readonly ok: true; readonly journal: Journal }
  | { readonly ok: false; readonly reason: 'invalid-label' | 'invalid-price' }

/**
 * Sets the goal, replacing any other. Replacing a goal reached starts counting again from
 * `now`; replacing one not reached keeps its starting point, so changing one's mind costs
 * nothing.
 */
export function setGoal(
  journal: Journal,
  goal: { readonly label: string; readonly priceCents: number },
  now: number,
): SetGoalResult {
  const label = goal.label.trim()
  if (!isValidLabel(label)) return { ok: false, reason: 'invalid-label' }
  if (!isValidPrice(goal.priceCents)) return { ok: false, reason: 'invalid-price' }
  const quitMoment = latestQuitMoment(journal)
  const current = quitMoment === null ? null : goalProgress(journal, quitMoment, now)
  const countsFrom = current?.reached === true ? now : (journal.goal?.countsFrom ?? null)
  return {
    ok: true,
    journal: {
      ...journal,
      goal: { label, priceCents: goal.priceCents, countsFrom, celebrated: false },
    },
  }
}

/** Remembers that the celebration of the goal reached was seen. */
export function markGoalCelebrated(journal: Journal): Journal {
  if (journal.goal === null || journal.goal.celebrated) return journal
  return { ...journal, goal: { ...journal.goal, celebrated: true } }
}
