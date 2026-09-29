/** The hero figure's size, as a share of the hero's width (`cqi`), up to two digits. */
const FULL_SIZE_CQI = 62

/**
 * The width budget over one digit's advance: a Host Grotesk tabular digit, tracking included,
 * is 0.595em wide and the figure gets ~90cqi between the side insets; kept a little under that.
 */
const WIDTH_PER_DIGIT_CQI = 144

/**
 * The streak figure's font size: the full hero size while the days fit, smaller once a third
 * or fourth digit would run past the hero's side insets.
 */
export function streakFigureSize(days: number): string {
  const digits = String(Math.abs(days)).length
  return `${Math.min(FULL_SIZE_CQI, Math.floor(WIDTH_PER_DIGIT_CQI / digits))}cqi`
}
