import { cn } from '@/shared/utils/cn'

type MinuteStepsProps = {
  /** How many minutes the timer lasts: one step each. */
  total: number
  /** Whole minutes already held. The next step is the one running. */
  held: number
  /** Celebration: the steps enter in sequence, the multiplier's signature. */
  celebrate?: boolean
}

/**
 * The timer's minutes as a row of flat steps on the page: held in full white,
 * the running one half-lit, the rest faint. Decorative: the countdown carries the value.
 */
export function MinuteSteps({ total, held, celebrate = false }: MinuteStepsProps) {
  return (
    <ol aria-hidden="true" className="grid w-full max-w-60 grid-cols-4 gap-1.5">
      {Array.from({ length: total }, (_, minute) => (
        <li
          // biome-ignore lint/suspicious/noArrayIndexKey: a minute's position is its identity.
          key={minute}
          style={celebrate ? { animationDelay: `${minute * 60}ms` } : undefined}
          className={cn(
            'h-2 rounded-full transition-colors duration-240 ease-out-expo motion-reduce:transition-none',
            minute < held && 'bg-white',
            minute === held && 'bg-white/45',
            minute > held && 'bg-white/20',
            celebrate && 'motion-safe:animate-step-in',
          )}
        />
      ))}
    </ol>
  )
}
