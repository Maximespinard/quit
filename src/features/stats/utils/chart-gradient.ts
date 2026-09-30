/**
 * The length of a bar's gradient along its own axis, as a share of the bar: the gradient spans
 * the whole scale, so a bar shows only the part up to its value and only the tallest reaches the
 * high end. An empty bar or scale draws nothing, and gets the gradient as it is.
 */
export const gradientLength = (value: number, max: number) =>
  value === 0 || max === 0 ? '100%' : `${(max / value) * 100}%`
