import { Cigarette, Timer } from 'lucide-react'
import type { DayPatch } from '@/shared/domain/patch-calendar'
import { cn } from '@/shared/utils/cn'

/**
 * The patch application a day asks for, one shape per state so hue is never the only cue:
 * a cream dot once logged, a flat dash when it was not, a cream ring while still to put on,
 * a faint pip while planned.
 */
export function PatchMark({ patch }: { patch: DayPatch }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block shrink-0 rounded-full',
        patch === 'logged' && 'size-2 bg-ink',
        patch === 'missing' && 'h-0.5 w-2.5 bg-muted',
        patch === 'due' && 'size-2.5 border-2 border-ink',
        patch === 'planned' && 'size-1.5 bg-muted',
      )}
    />
  )
}

/** A lapse's mark: the fact itself, drawn small. */
export const CigaretteMark = () => (
  <Cigarette aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
)

/** A craving's mark: the timer of the `Envie` pill. */
export const CravingMark = () => (
  <Timer aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2} />
)
