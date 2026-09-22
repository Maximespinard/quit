import type { Streak } from '@/shared/domain/derive'
import { StreakHero } from '@/shared/ui/StreakHero'
import { splitDuration } from '@/shared/utils/duration'
import { strings } from '@/shared/utils/strings'
import { formatQuitMoment } from '../utils/format-quit-moment'

type StreakScreenProps = {
  quitMoment: number
  streak: Streak
}

/** The home screen once a quit moment exists: the streak as elapsed time, live. */
export function StreakScreen({ quitMoment, streak }: StreakScreenProps) {
  const { days, hours, minutes } = splitDuration(streak.elapsedMs)

  return (
    <StreakHero
      days={days}
      hours={hours}
      minutes={minutes}
      daysLabel={strings.streak.days}
      brand={strings.app.name}
      context={strings.streak.since(formatQuitMoment(quitMoment))}
    />
  )
}
