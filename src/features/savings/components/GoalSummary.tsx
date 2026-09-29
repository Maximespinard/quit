import { Link } from '@tanstack/react-router'
import type { GoalProgress } from '@/shared/domain/derive'
import type { Journal } from '@/shared/domain/journal'
import { buttonVariants } from '@/shared/ui/base/button'
import { Card } from '@/shared/ui/Card'
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

const cardAction = cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'shrink-0')

/** Home screen block: the goal and the money saved towards it, or the way to set one. */
export function GoalSummary({ journal, goal, onCelebrated }: GoalSummaryProps) {
  const celebrating = useGoalCelebration(journal, goal, onCelebrated)
  const percent =
    goal === null ? 0 : Math.min(100, Math.floor((goal.savedCents * 100) / goal.priceCents))
  const progress =
    goal === null ? '' : copy.progress(formatEuros(goal.savedCents), formatEuros(goal.priceCents))

  return (
    <Card
      title={copy.title}
      aside={
        goal?.reached ? (
          <span className={cn('text-muted', celebrating && 'motion-safe:animate-step-in')}>
            {copy.reached}
          </span>
        ) : null
      }
    >
      {goal === null ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-body text-muted">{copy.none}</p>
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
        <>
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 truncate text-title">{goal.label}</p>
            <Link to="/goal" search={keepSearch} className={cardAction}>
              {copy.edit}
            </Link>
          </div>
          <div className="flex items-baseline justify-between gap-3 text-body text-muted">
            <span>{progress}</span>
            <span>{copy.percent(percent)}</span>
          </div>
          <ProgressBar
            label={copy.barLabel(goal.label)}
            value={goal.savedCents}
            max={goal.priceCents}
            valueText={progress}
          />
        </>
      )}
    </Card>
  )
}
