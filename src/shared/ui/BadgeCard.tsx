import { Lock } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

type BadgeCardProps = {
  name: string
  /** When the badge was or will be earned, e.g. "J+7". */
  detail: string
  unlocked: boolean
  /** Accessible suffix for locked badges, e.g. "à débloquer". */
  lockedLabel: string
}

/** A square card: earned badges sit on surface, locked ones are a hairline outline with a lock. */
export function BadgeCard({ name, detail, unlocked, lockedLabel }: BadgeCardProps) {
  return (
    <div
      className={cn(
        'flex aspect-square flex-col justify-between rounded-card p-3',
        unlocked ? 'bg-surface text-ink' : 'border border-line text-muted',
      )}
    >
      <span className="h-6">
        {unlocked ? null : <Lock aria-hidden="true" className="size-6" strokeWidth={1.75} />}
      </span>
      <span className="flex flex-col gap-1 leading-tight">
        <span className="font-medium text-body">
          {name}
          {unlocked ? null : <span className="sr-only"> — {lockedLabel}</span>}
        </span>
        <span className={cn('text-detail', unlocked && 'text-muted')}>{detail}</span>
      </span>
    </div>
  )
}
