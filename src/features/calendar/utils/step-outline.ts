import type { CalendarStep } from '../domain/patch-calendar'

/** The faintest and the strongest outline, as a percentage of cream: 3.1:1 and 16:1 on a card. */
const FAINTEST_PERCENT = 40
const STRONGEST_PERCENT = 100

/**
 * The outline colour of each step, in step order: the doses ranked and spread evenly from
 * faint cream (lowest dose) to full cream (highest), so neighbouring steps never look alike
 * whatever their doses. Cream, never a fill hue: a fill means a lived day. A protocol with one
 * dose throughout takes the strongest.
 */
export function stepOutlines(steps: readonly CalendarStep[]): string[] {
  const doses = [...new Set(steps.map(({ step }) => step.doseMg))].sort((a, b) => a - b)
  return steps.map(({ step }) => {
    const rank = doses.indexOf(step.doseMg)
    const share =
      doses.length === 1
        ? STRONGEST_PERCENT
        : Math.round(
            FAINTEST_PERCENT + ((STRONGEST_PERCENT - FAINTEST_PERCENT) * rank) / (doses.length - 1),
          )
    return `color-mix(in oklab, var(--color-ink) ${share}%, transparent)`
  })
}
