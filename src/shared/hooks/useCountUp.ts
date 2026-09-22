import { useEffect, useState } from 'react'

const DURATION_MS = 240
const MAX_STEPS = 12

const prefersReducedMotion = () =>
  typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Counts up to `target` in whole steps, the way a mechanical counter lands: a fixed
 * cadence and a settle, never a smooth per-frame interpolation.
 * Honours `prefers-reduced-motion` by rendering the target from the first paint.
 */
export function useCountUp(target: number): number {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0))

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target)
      return
    }

    const steps = Math.min(Math.abs(target), MAX_STEPS)
    if (steps === 0) {
      setValue(target)
      return
    }

    let step = 0
    setValue(0)
    const timer = setInterval(() => {
      step += 1
      if (step >= steps) {
        setValue(target)
        clearInterval(timer)
        return
      }
      setValue(Math.round((target * step) / steps))
    }, DURATION_MS / steps)

    return () => clearInterval(timer)
  }, [target])

  return value
}
