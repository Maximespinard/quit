import { useEffect, useState } from 'react'
import { SECOND_MS } from '@/shared/utils/duration'

/** Floors to the whole second: the display grid must not depend on any fact's ms offset. */
const wholeSecond = (ms: number) => ms - (ms % SECOND_MS)

/**
 * The one place in the UI layer that reads the clock (ADR-0002): everything below
 * takes `now` as a parameter, floored to the whole second. A fact's timestamp (e.g. the
 * quit moment set via "Maintenant") can land on any millisecond; if `now` kept its own
 * ms, the display's second could roll over right where a timer's jitter lands, showing
 * a second twice or skipping one. Flooring makes every change of `now` exactly 1000ms
 * apart, so the streak always advances by whole seconds.
 * Ticks on the second boundary, and again when the tab comes back to the foreground,
 * since timers stall while it is hidden.
 */
export function useNow(): number {
  const [now, setNow] = useState(() => wholeSecond(Date.now()))

  useEffect(() => {
    let timer = 0
    const tick = () => {
      const current = Date.now()
      setNow(wholeSecond(current))
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
