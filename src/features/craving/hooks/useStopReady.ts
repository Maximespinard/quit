import { useEffect, useState } from 'react'

/**
 * How long `Arrêter` waits once the running timer is on screen. Envie sits in the same thumb
 * band: without the wait, the second tap of a double tap on Envie would stop the timer it just
 * started. `--animate-stop-in` (`src/index.css`) ends on this instant: change both together.
 */
export const STOP_DELAY_MS = 800

/**
 * Whether `Arrêter` answers yet: false for `STOP_DELAY_MS` after mount, then true. Counted from
 * mount, not from the timer's start, so a timer reopened mid-run waits once too.
 */
export function useStopReady(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), STOP_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [])

  return ready
}
