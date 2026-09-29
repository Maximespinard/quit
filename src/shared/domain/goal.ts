import { centsSchema, goalLabelSchema } from '@quit/contract/settings'
import { latestQuitMoment } from './facts/quit-moment'
import type { Journal } from './journal'
import { goalProgress } from './savings'

const isValidLabel = (label: string) => goalLabelSchema.safeParse(label).success

const isValidPrice = (cents: number) => centsSchema.safeParse(cents).success

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
