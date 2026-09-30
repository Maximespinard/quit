import type { CalendarStep } from '../domain/patch-calendar'

/** The lightest and the strongest outline: 3.1:1 and 16:1 on a card, so even the faintest reads. */
const FAINTEST = 40
const STRONGEST = 100

/**
 * The outline colour of each step, in step order: the doses ranked and spread evenly from
 * faint cream (lowest dose) to full cream (highest), so neighbouring steps never look alike
 * whatever their doses. Cream, never Braise: Braise is the lived days' fill. A protocol with
 * one dose throughout takes the strongest.
 */
export function stepTints(steps: readonly CalendarStep[]): string[] {
  const doses = [...new Set(steps.map(({ step }) => step.doseMg))].sort((a, b) => a - b)
  return steps.map(({ step }) => {
    const rank = doses.indexOf(step.doseMg)
    const share =
      doses.length === 1
        ? STRONGEST
        : Math.round(FAINTEST + ((STRONGEST - FAINTEST) * rank) / (doses.length - 1))
    return `color-mix(in oklab, var(--color-ink) ${share}%, transparent)`
  })
}
