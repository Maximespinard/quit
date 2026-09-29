import { useEffect, useState } from 'react'
import { COUNT_UP_MS, countUpAt, countUpSteps } from '@/shared/utils/count-up'
import { prefersReducedMotion } from '@/shared/utils/reduced-motion'

/**
 * Counts up to `target` in whole steps, the way a mechanical counter lands: a fixed
 * cadence and a settle, never a smooth per-frame interpolation. Replays from 0 whenever
 * `target` changes, for a celebration that starts when its figure arrives.
 * Honours `prefers-reduced-motion` by rendering the target from the first paint.
 */
export function useCountUp(target: number): number {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0))

  useEffect(() => {
    const steps = countUpSteps(target)
    if (prefersReducedMotion() || steps === 0) {
      setValue(target)
      return
    }

    let step = 0
    setValue(0)
    const timer = setInterval(() => {
      step += 1
      setValue(countUpAt(target, step / steps))
      if (step >= steps) clearInterval(timer)
    }, COUNT_UP_MS / steps)

    return () => clearInterval(timer)
  }, [target])

  return value
}
