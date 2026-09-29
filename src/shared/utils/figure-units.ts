export type FigureSegment = { text: string; unit: boolean }

/**
 * The units a figure may carry, each after a no-break space as the strings module and `Intl`
 * write them: euros, percent, days, hours, minutes.
 */
const UNIT = /( (?:€|%|j|h|min))(?=\s|$)/

/**
 * Splits a formatted figure into its numbers and its units, so the units can be set smaller and
 * muted while the copy stays one string in the strings module.
 */
export function splitUnits(text: string): FigureSegment[] {
  return text
    .split(UNIT)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, unit: UNIT.test(part) }))
}
