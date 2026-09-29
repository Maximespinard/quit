import { MINUTE_MS } from '@/shared/utils/duration'

// No seconds: the panel moves time by hours and days, and a ticking digit pulls the eye.
const clockFormat = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** The sandbox clock as the panel shows it, in the device's time zone. */
export const formatClock = (ms: number) => clockFormat.format(ms)

/**
 * The machine-readable twin of `formatClock`, to the same minute: `now` ticks every second,
 * but the panel's `<time>` only changes once a minute.
 */
export const clockDateTime = (ms: number) => new Date(ms - (ms % MINUTE_MS)).toISOString()
