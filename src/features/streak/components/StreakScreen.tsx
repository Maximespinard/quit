import type { ReactNode } from 'react'
import type { Streak } from '@/shared/domain/derive'
import { useLaunchEntrance } from '@/shared/hooks/useLaunchEntrance'
import { HeroHaze } from '@/shared/ui/HeroHaze'
import { StreakHero } from '@/shared/ui/StreakHero'
import { splitDuration } from '@/shared/utils/duration'
import { strings } from '@/shared/utils/strings'

/** The hero counts up when the app is opened, not each time home is shown again. */
const HOME_ENTRANCE = 'home-streak'

type StreakScreenProps = {
  streak: Streak
  /** The brand mark, which the app layer may wire to a gesture. */
  brand: ReactNode
  /** The hero's top-right context, e.g. the current protocol step. */
  context?: ReactNode
  /** The hero's top-right control, after the context (settings). */
  action?: ReactNode
  /** Blocks under the hero, composed by the app layer: dark cards, 10px apart. */
  children?: ReactNode
}

/** The home screen once a quit moment exists: the streak as elapsed time, live, out of the haze. */
export function StreakScreen({ streak, brand, context, action, children }: StreakScreenProps) {
  const duration = splitDuration(streak.elapsedMs)
  const entrance = useLaunchEntrance(HOME_ENTRANCE)

  return (
    <div className="relative isolate">
      <HeroHaze />
      <div className="mx-auto max-w-md">
        <StreakHero
          duration={duration}
          daysLabel={strings.streak.days(duration.days)}
          regionLabel={strings.streak.region}
          brand={brand}
          context={context}
          action={action}
          entrance={entrance}
        />
        {children ? <div className="flex flex-col gap-2.5 px-3 pt-16 pb-4">{children}</div> : null}
      </div>
    </div>
  )
}
