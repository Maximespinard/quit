import type { Page } from '@playwright/test'

/** Thursday 1 January 2026, 12:00 UTC — 13:00 in Paris: the instant the sandbox specs stop on. */
export const NOW = Date.UTC(2026, 0, 1, 12, 0, 0)
export const HOUR = 60 * 60_000
export const DAY = 24 * HOUR

/** An instant as the page's `datetime-local` field takes it, in the browser's own time zone. */
export const localInput = (page: Page, at: number) =>
  page.evaluate((ms) => {
    const d = new Date(ms)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }, at)
