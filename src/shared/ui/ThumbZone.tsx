import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

type ThumbZoneProps = {
  /** The primary action, with anything that must stay beside it (an "or" rule). */
  children: ReactNode
  /**
   * Stuck to the screen's bottom edge while the column above scrolls, on a fade to the page:
   * for a form whose height has no bound (a craving's tags). What follows it must be
   * `relative`, to paint over the mask under it.
   */
  sticky?: boolean
}

/**
 * The Thumb Zone Rule: a screen's primary action, held down at the bottom of a full-height
 * column (`flex-1 flex-col`). What follows it in the column (the way out, a deletion) sits
 * under it. A column taller than the screen scrolls, and the action comes last, never covered.
 */
export function ThumbZone({ children, sticky = false }: ThumbZoneProps) {
  return (
    <div
      className={cn(
        'mt-auto flex flex-col gap-3',
        // Stuck as high as the page's own bottom edge; the band under it is masked in `page`.
        // Offset, not padding: in flow, the way out keeps the same gap under it as elsewhere.
        sticky &&
          'sticky bottom-(--page-clearance) bg-linear-to-b from-transparent to-page to-40% pt-6 after:absolute after:inset-x-0 after:top-full after:h-(--page-clearance) after:bg-page',
      )}
    >
      {children}
    </div>
  )
}
