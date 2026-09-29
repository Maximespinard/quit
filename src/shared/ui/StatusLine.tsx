import { useEffect, useState } from 'react'
import { cn } from '@/shared/utils/cn'

type StatusLineProps = {
  /** What to confirm, or `null` when there is nothing to say. */
  message: string | null
  className?: string
}

/**
 * A quiet confirmation line. The region is always mounted, and its text is set once it is in the
 * DOM: a screen reader announces a live region that changes, not one that mounts already holding
 * its text. Empty, it takes no room but stays in the accessibility tree (`sr-only`, not `hidden`):
 * a region under `display: none` is not watched, so filling it would not be announced either.
 */
export function StatusLine({ message, className }: StatusLineProps) {
  const [shown, setShown] = useState<string | null>(null)

  useEffect(() => {
    setShown(message)
  }, [message])

  return (
    <p role="status" className={cn('text-body text-muted empty:sr-only', className)}>
      {shown}
    </p>
  )
}
