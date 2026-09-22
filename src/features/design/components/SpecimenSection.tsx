import type { ReactNode } from 'react'

type SpecimenSectionProps = {
  title: string
  /** Optional right-aligned figure, e.g. "2 / 12". */
  aside?: ReactNode
  children: ReactNode
}

/** A titled block: heading row on the left, figure on the right, content below. */
export function SpecimenSection({ title, aside, children }: SpecimenSectionProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between text-label">
        <h2 className="font-semibold text-body text-ink">{title}</h2>
        {aside ? <span className="text-ink-soft">{aside}</span> : null}
      </div>
      {children}
    </section>
  )
}
