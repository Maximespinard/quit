import type { Streak } from '@/shared/domain/derive'
import { StreakHero } from '@/shared/ui/StreakHero'
import { splitDuration } from '@/shared/utils/duration'
import { strings } from '@/shared/utils/strings'

type StreakScreenProps = {
  streak: Streak
}

/** The home screen once a quit moment exists: the streak as elapsed time, live. */
export function StreakScreen({ streak }: StreakScreenProps) {
  const { days, hours, minutes, seconds } = splitDuration(streak.elapsedMs)

  return (
    <div className="mx-auto max-w-md">
      <StreakHero
        days={days}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
        daysLabel={strings.streak.days(days)}
        regionLabel={strings.streak.region}
        brand={strings.app.name}
      />
    </div>
  )
}
