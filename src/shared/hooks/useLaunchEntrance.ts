import { useEffect, useState } from 'react'

export const ENTRANCE_MS = 240
const TICKS = 12

/**
 * The entrances already played since the app was opened. Transient UI state, never
 * persisted: a cold start, a full reload or a PWA relaunch starts it empty again.
 */
const played = new Set<string>()

const prefersReducedMotion = () =>
  typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * An entrance that plays once per app launch: the progress (0 to 1) of the first mount of
 * `key`, stepped at a fixed cadence. Every later mount, and reduced motion, gets 1 from the
 * first paint. Once started it counts as played, so leaving mid-way does not replay it.
 */
export function useLaunchEntrance(key: string): number {
  const [plays] = useState(() => !played.has(key) && !prefersReducedMotion())
  const [tick, setTick] = useState(plays ? 0 : TICKS)

  useEffect(() => {
    if (!plays) return
    played.add(key)
    let current = 0
    const timer = setInterval(() => {
      current += 1
      setTick(current)
      if (current >= TICKS) clearInterval(timer)
    }, ENTRANCE_MS / TICKS)
    return () => clearInterval(timer)
  }, [plays, key])

  return tick / TICKS
}
