import { useEffect, useState } from 'react'
import { COUNT_UP_MAX_STEPS, COUNT_UP_MS } from '@/shared/utils/count-up'
import { prefersReducedMotion } from '@/shared/utils/reduced-motion'

/** One tick per step of the largest count-up, so every figure lands on a tick. */
const TICKS = COUNT_UP_MAX_STEPS

/**
 * The entrances already played since the app was opened. Transient UI state, never
 * persisted: a cold start, a full reload or a PWA relaunch starts it empty again.
 */
const played = new Set<string>()

/**
 * An entrance that plays once per app launch: the progress (0 to 1) of the first mount of
 * `key`, stepped at a fixed cadence. Every later mount, and reduced motion, gets 1 from the
 * first paint. Once started it counts as played, so leaving mid-way does not replay it.
 */
export function useLaunchEntrance(key: string): number {
  const [plays] = useState(() => !played.has(key) && !prefersReducedMotion())
  const [tick, setTick] = useState(plays ? 0 : TICKS)

  useEffect(() => {
    // Spent even when it does not play: turning reduced motion off later must not replay it.
    played.add(key)
    if (!plays) return
    let current = 0
    const timer = setInterval(() => {
      current += 1
      setTick(current)
      if (current >= TICKS) clearInterval(timer)
    }, COUNT_UP_MS / TICKS)
    return () => clearInterval(timer)
  }, [plays, key])

  return tick / TICKS
}
