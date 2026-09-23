import type { ReactNode } from 'react'
import type { Streak } from '@/shared/domain/derive'
import { StreakHero } from '@/shared/ui/StreakHero'
import { splitDuration } from '@/shared/utils/duration'
import { strings } from '@/shared/utils/strings'

type StreakScreenProps = {
  streak: Streak
  /** The brand mark, which the app layer may wire to a gesture. */
  brand: ReactNode
  /** The hero's top-right context, e.g. the current protocol step. */
  context?: ReactNode
  /** Blocks under the hero, composed by the app layer. */
  children?: ReactNode
}

/** The home screen once a quit moment exists: the streak as elapsed time, live. */
export function StreakScreen({ streak, brand, context, children }: StreakScreenProps) {
  const duration = splitDuration(streak.elapsedMs)

  return (
    <div className="mx-auto max-w-md">
      <StreakHero
        duration={duration}
        daysLabel={strings.streak.days(duration.days)}
        regionLabel={strings.streak.region}
        brand={brand}
        context={context}
      />
      {children ? <div className="flex flex-col gap-5 px-safe pt-5 pb-4">{children}</div> : null}
    </div>
  )
}
