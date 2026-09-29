import { type ReactNode, useId } from 'react'
import { cn } from '@/shared/utils/cn'

/**
 * The card's inset. `block`: 20px all round, the one card padding of the world. `rows`: the
 * same 20px sides, rows bring their own height (lists split by hairlines). `none`: the content
 * owns its inset (a grid of cells, a calendar).
 */
const PADDING = {
  block: 'p-5',
  rows: 'px-5',
  none: '',
} as const

type CardProps = {
  /** The card's name, shown small and muted at its top: the region's accessible name too. */
  title?: string
  /** The title's heading level: 2 on the home, 3 under a screen's own heading. */
  headingLevel?: 2 | 3
  /** Shown across from the title, e.g. a status or a percentage. */
  aside?: ReactNode
  /** The region's accessible name when the card shows no title. */
  label?: string
  padding?: keyof typeof PADDING
  /** Layout inside the card (gap, direction). Never its surface or its padding. */
  className?: string
  children: ReactNode
}

/**
 * The one dark card of the world: `surface` on the page, radius 12, 20px inside. Named, it is
 * a region; unnamed, a plain surface holding a list or a grid.
 */
export function Card({
  title,
  headingLevel = 2,
  aside,
  label,
  padding = 'block',
  className,
  children,
}: CardProps) {
  const titleId = useId()
  const surface = cn('flex flex-col rounded-card bg-surface', PADDING[padding], className)

  if (title === undefined) {
    return label === undefined ? (
      <div className={surface}>{children}</div>
    ) : (
      <section aria-label={label} className={surface}>
        {children}
      </section>
    )
  }
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <section aria-labelledby={titleId} className={cn('gap-3.5', surface)}>
      <div className="flex items-baseline justify-between gap-3 text-label">
        <Heading id={titleId} className="text-muted">
          {title}
        </Heading>
        {aside}
      </div>
      {children}
    </section>
  )
}
