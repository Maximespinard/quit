import { splitUnits } from '@/shared/utils/figure-units'

/**
 * A formatted figure with its units set smaller and muted (`220,08 €`, `46 j 07 h`), as the
 * visual target draws them. Screen readers get the same string, read as one.
 */
export function Figure({ children }: { children: string }) {
  return splitUnits(children).map(({ text, unit }, index) =>
    unit ? (
      // Segments never reorder: their position is their identity.
      // biome-ignore lint/suspicious/noArrayIndexKey: a figure's segments have no id of their own
      <span key={index} className="text-muted text-unit">
        {text}
      </span>
    ) : (
      text
    ),
  )
}
