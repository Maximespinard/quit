/**
 * The local calendar day holding `ms`, as `[start, end)` in ms. Built from the calendar
 * rather than `+ DAY_MS`, so a day across a DST change keeps its 23 or 25 hours.
 */
export function localDay(ms: number): { readonly start: number; readonly end: number } {
  const date = new Date(ms)
  const [year, month, day] = [date.getFullYear(), date.getMonth(), date.getDate()]
  return {
    start: new Date(year, month, day).getTime(),
    end: new Date(year, month, day + 1).getTime(),
  }
}
