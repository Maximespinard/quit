import { type MouseEvent, useEffect, useRef } from 'react'

/** Long enough that a tap or the start of a scroll never triggers it. */
const LONG_PRESS_MS = 1_000

/** Pointer handlers firing `onLongPress` once a press is held; lifting, leaving or scrolling cancels. */
export function useLongPress(onLongPress: () => void) {
  const timer = useRef<number | undefined>(undefined)
  const cancel = () => window.clearTimeout(timer.current)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return {
    onPointerDown: () => {
      cancel()
      timer.current = window.setTimeout(onLongPress, LONG_PRESS_MS)
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    // iOS would open its callout menu on the held text instead.
    onContextMenu: (event: MouseEvent) => event.preventDefault(),
  }
}
