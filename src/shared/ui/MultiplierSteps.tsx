import { cn } from '@/shared/utils/cn'

type MultiplierStepsProps = {
  /** Every reachable multiplier, in order, e.g. [1, 2, 3, 4, 5]. */
  steps: readonly number[]
  /** The multiplier currently applied. Must be one of `steps`. */
  current: number
  /** Accessible name of the row. */
  label: string
}

/** Five flat steps: acquired in ink, the current one in steel, the rest outlined. */
export function MultiplierSteps({ steps, current, label }: MultiplierStepsProps) {
  return (
    <ol aria-label={label} className="grid grid-cols-5 gap-1.5">
      {steps.map((step, index) => {
        const state = step < current ? 'acquired' : step === current ? 'current' : 'locked'
        return (
          <li
            key={step}
            aria-current={state === 'current' ? 'step' : undefined}
            data-state={state}
            style={{ animationDelay: `${index * 60}ms` }}
            className={cn(
              'grid h-10.5 place-items-center rounded-step border font-semibold text-body motion-safe:animate-step-in',
              state === 'acquired' && 'border-ink bg-ink text-on-ink',
              state === 'current' && 'border-reached bg-reached text-white',
              state === 'locked' && 'border-line bg-transparent text-ink-soft',
            )}
          >
            ×{step}
          </li>
        )
      })}
    </ol>
  )
}
