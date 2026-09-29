import { type ReactNode, useId } from 'react'
import { cn } from '@/shared/utils/cn'

type CardProps = {
  /** The card's name, shown small and muted at its top: the region's accessible name too. */
  title: string
  /** Shown across from the title, e.g. a status or a percentage. */
  aside?: ReactNode
  className?: string
  children: ReactNode
}

/** A dark home card: a muted eyebrow title, then its content. */
export function Card({ title, aside, className, children }: CardProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className={cn('flex flex-col gap-3.5 rounded-card bg-surface p-5', className)}
    >
      <div className="flex items-baseline justify-between gap-3 text-label">
        <h2 id={titleId} className="text-muted">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}
