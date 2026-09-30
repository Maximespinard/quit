/** A local wall-clock time; `month` is 1-based. The suite runs in Europe/Paris (vite.config). */
export const local = (month: number, day: number, hour = 0, minute = 0, year = 2026): number =>
  new Date(year, month - 1, day, hour, minute).getTime()
