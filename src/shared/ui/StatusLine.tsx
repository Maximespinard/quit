import { useEffect, useState } from 'react'
import { cn } from '@/shared/utils/cn'

type StatusLineProps = {
  /** What to confirm, or `null` when there is nothing to say. */
  message: string | null
  className?: string
}

/**
 * A quiet confirmation line. The region is always mounted, empty and hidden when there is nothing
 * to say, and its text is set once it is in the DOM: a screen reader announces a live region
 * that changes, not one that mounts already holding its text.
 */
export function StatusLine({ message, className }: StatusLineProps) {
  const [shown, setShown] = useState<string | null>(null)

  useEffect(() => {
    setShown(message)
  }, [message])

  return (
    <p role="status" className={cn('text-body text-muted empty:hidden', className)}>
      {shown}
    </p>
  )
}
