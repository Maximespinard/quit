import type { ReactNode } from 'react'

export type FigureRow = { label: string; value: ReactNode }

/** A card's figures, one per row: the label on the left, the figure on the right, a hairline between. */
export function FigureRows({ rows }: { rows: readonly FigureRow[] }) {
  return (
    <dl className="flex flex-col divide-y divide-line">
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0"
        >
          <dt className="text-body text-muted">{label}</dt>
          <dd className="whitespace-nowrap text-figure tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
