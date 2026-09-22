import { useEffect, useState } from 'react'
import { SECOND_MS } from '@/shared/utils/duration'

/**
 * The one place in the UI layer that reads the clock (ADR-0002): everything below
 * takes `now` as a parameter. Ticks on the second boundary, and again when the tab
 * comes back to the foreground, since timers stall while it is hidden.
 */
export function useNow(): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let timer = 0
    const tick = () => {
      const current = Date.now()
      setNow(current)
      timer = window.setTimeout(tick, SECOND_MS - (current % SECOND_MS))
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        window.clearTimeout(timer)
        tick()
      }
    }
    tick()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return now
}
