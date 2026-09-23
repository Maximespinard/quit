import type { ReactNode } from 'react'
import type { Streak } from '@/shared/domain/derive'
import { StreakHero } from '@/shared/ui/StreakHero'
import { splitDuration } from '@/shared/utils/duration'
import { strings } from '@/shared/utils/strings'

type StreakScreenProps = {
  streak: Streak
  /** The brand mark, which the app layer may wire to a gesture. */
  brand: ReactNode
}

/** The home screen once a quit moment exists: the streak as elapsed time, live. */
export function StreakScreen({ streak, brand }: StreakScreenProps) {
  const duration = splitDuration(streak.elapsedMs)

  return (
    <div className="mx-auto max-w-md">
      <StreakHero
        duration={duration}
        daysLabel={strings.streak.days(duration.days)}
        regionLabel={strings.streak.region}
        brand={brand}
      />
    </div>
  )
}
