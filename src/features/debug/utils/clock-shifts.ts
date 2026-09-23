import { DAY_MS, HOUR_MS } from '@/shared/utils/duration'

/** The panel's clock moves, in button order: back a day, back an hour, forward an hour, a day. */
export const clockShifts = [
  { copyKey: 'dayBack', byMs: -DAY_MS },
  { copyKey: 'hourBack', byMs: -HOUR_MS },
  { copyKey: 'hourForward', byMs: HOUR_MS },
  { copyKey: 'dayForward', byMs: DAY_MS },
] as const
