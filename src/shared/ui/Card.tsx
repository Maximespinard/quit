import { type ReactNode, useId } from 'react'

type CardProps = {
  /** The card's name, shown small and muted at its top: the region's accessible name too. */
  title: string
  /** Shown across from the title, e.g. a status or a percentage. */
  aside?: ReactNode
  children: ReactNode
}

/** A dark home card: a muted eyebrow title, then its content. */
export function Card({ title, aside, children }: CardProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-3.5 rounded-card bg-surface p-5"
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
