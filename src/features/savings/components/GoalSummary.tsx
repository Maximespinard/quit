import { Link } from '@tanstack/react-router'
import { useId } from 'react'
import type { GoalProgress } from '@/shared/domain/derive'
import type { Journal } from '@/shared/domain/journal'
import { buttonVariants } from '@/shared/ui/base/button'
import { ProgressBar } from '@/shared/ui/ProgressBar'
import { keepSearch } from '@/shared/utils/app-search'
import { cn } from '@/shared/utils/cn'
import { formatEuros } from '@/shared/utils/euros'
import { strings } from '@/shared/utils/strings'
import { useGoalCelebration } from '../hooks/useGoalCelebration'
import { GoalReached } from './GoalReached'

type GoalSummaryProps = {
  journal: Journal
  /** `null` until a goal is set. */
  goal: GoalProgress | null
  /** Stores that the goal reached was celebrated. */
  onCelebrated: (journal: Journal) => Promise<void>
}

const copy = strings.goal

// On the surface card the outline's own press fill would not show.
const cardAction = cn(
  buttonVariants({ variant: 'outline', size: 'sm' }),
  'shrink-0 active:bg-surface-locked',
)

/** Home screen block: the goal and the money saved towards it, or the way to set one. */
export function GoalSummary({ journal, goal, onCelebrated }: GoalSummaryProps) {
  const titleId = useId()
  const celebrating = useGoalCelebration(journal, goal, onCelebrated)
  const percent =
    goal === null ? 0 : Math.min(100, Math.floor((goal.savedCents * 100) / goal.priceCents))
  const progress =
    goal === null ? '' : copy.progress(formatEuros(goal.savedCents), formatEuros(goal.priceCents))

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between text-label">
        <h2 id={titleId} className="font-semibold text-body text-ink">
          {copy.title}
        </h2>
        {goal === null ? null : goal.reached ? (
          <span className={cn('text-ink-soft', celebrating && 'motion-safe:animate-step-in')}>
            {copy.reached}
          </span>
        ) : (
          <span className="text-ink-soft">{copy.percent(percent)}</span>
        )}
      </div>

      {goal === null ? (
        <div className="flex flex-col items-start gap-3 rounded-card bg-surface p-4">
          <p className="text-body text-ink-dim">{copy.none}</p>
          <Link to="/goal" search={keepSearch} className={cardAction}>
            {copy.choose}
          </Link>
        </div>
      ) : goal.reached ? (
        <GoalReached
          goal={goal}
          celebrating={celebrating}
          action={
            <Link to="/goal" search={keepSearch} className={cardAction}>
              {copy.replace}
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3 rounded-card bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <p className="truncate font-semibold text-body">{goal.label}</p>
              <p className="text-ink-dim text-label">{progress}</p>
            </div>
            <Link to="/goal" search={keepSearch} className={cardAction}>
              {copy.edit}
            </Link>
          </div>
          <ProgressBar
            label={copy.barLabel(goal.label)}
            value={goal.savedCents}
            max={goal.priceCents}
            valueText={progress}
          />
        </div>
      )}
    </section>
  )
}
