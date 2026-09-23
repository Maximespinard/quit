import { DAY_MS, HOUR_MS } from '@/shared/utils/duration'

/** The panel's clock moves, in button order: back a day, back an hour, forward an hour, a day. */
export const clockShifts = [
  { label: 'dayBack', byMs: -DAY_MS },
  { label: 'hourBack', byMs: -HOUR_MS },
  { label: 'hourForward', byMs: HOUR_MS },
  { label: 'dayForward', byMs: DAY_MS },
] as const
