import type { ReactNode } from 'react'

type ThumbZoneProps = {
  /**
   * The primary action, with anything that must stay beside it (an "or" rule). On a screen
   * with nothing to record, its way out alone.
   */
  children: ReactNode
  /** Under the primary action: the way out, and on a fact's page its deletion. */
  secondary?: ReactNode
  /**
   * The primary action stuck to the screen's bottom edge while the column above scrolls, on a
   * fade to the page: for a form whose height has no bound (a craving's tags). The column's
   * own gap then separates it from `secondary`, and the column must end on `pb-page`.
   */
  sticky?: boolean
}

/**
 * The Thumb Zone Rule: a screen's primary action, held down at the bottom of a full-height
 * column (`flex-1 flex-col`), its secondary actions under it. A column taller than the screen
 * scrolls, and the actions come last, never covered.
 */
export function ThumbZone({ children, secondary, sticky = false }: ThumbZoneProps) {
  // Painted over the sticky variant's mask whenever the two meet.
  const rest =
    secondary === undefined ? null : <div className="relative flex flex-col gap-3">{secondary}</div>

  if (!sticky) {
    return (
      <div className="mt-auto flex flex-col gap-5">
        <div className="flex flex-col gap-3">{children}</div>
        {rest}
      </div>
    )
  }
  // A sticky box only moves inside its parent: the primary action must sit in the tall column
  // itself, the rest following it there.
  return (
    <>
      {/* Stuck as high as the page's own bottom edge, the band under it masked in `page`: an
          offset, not a padding, so in flow the gap under it stays the column's. */}
      <div className="sticky bottom-(--page-clearance) mt-auto flex flex-col gap-3 bg-linear-to-b from-transparent to-page to-40% pt-6 after:absolute after:inset-x-0 after:top-full after:h-(--page-clearance) after:bg-page">
        {children}
      </div>
      {rest}
    </>
  )
}
