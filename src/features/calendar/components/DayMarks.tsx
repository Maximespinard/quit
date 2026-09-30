import { Cigarette, Timer } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import type { DayPatch } from '../domain/patch-calendar'

/**
 * The patch application a day still lacks, one shape per state so hue is never the only cue:
 * a flat dash when it was not noted, a ring while still to put on, both in the cell's text colour. A day with its patch
 * logged is the normal case and stays bare.
 */
export function PatchMark({ patch }: { patch: Exclude<DayPatch, 'logged'> }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block shrink-0 rounded-full',
        patch === 'missing' && 'h-0.5 w-2.5 bg-current opacity-70',
        patch === 'due' && 'size-2.5 border-2 border-current',
      )}
    />
  )
}

/** A lapse's mark: the fact itself, drawn small. */
export const CigaretteMark = () => (
  <Cigarette aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
)

/** A craving's mark: the timer of the `Envie` pill, the day's count beside it. */
export const CravingMark = ({ count }: { count: number }) => (
  <span aria-hidden="true" className="inline-flex items-center gap-0.5">
    <Timer className="size-3.5 shrink-0" strokeWidth={2} />
    <span className="text-detail tabular-nums leading-none">{count}</span>
  </span>
)
