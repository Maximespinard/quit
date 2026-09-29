import { Cigarette, Timer } from 'lucide-react'
import type { DayPatch } from '@/shared/domain/patch-calendar'
import { cn } from '@/shared/utils/cn'

/**
 * The patch application a day asks for, as a dot: filled when logged, hollow when not,
 * ringed in the action colour while still to put on, a faint pip while planned.
 */
export function PatchMark({ patch }: { patch: DayPatch }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block shrink-0 rounded-full',
        patch === 'logged' && 'size-2 bg-ink',
        patch === 'missing' && 'size-2 border border-ink-soft',
        patch === 'due' && 'size-2 border-2 border-action',
        patch === 'planned' && 'size-1.5 bg-ink-soft/75',
      )}
    />
  )
}

/** A lapse's mark: the fact itself, drawn small. */
export const CigaretteMark = () => (
  <Cigarette aria-hidden="true" className="size-3 shrink-0" strokeWidth={2} />
)

/** A craving's mark: the timer of the `Envie` pill. */
export const CravingMark = () => (
  <Timer aria-hidden="true" className="size-3 shrink-0" strokeWidth={2} />
)
