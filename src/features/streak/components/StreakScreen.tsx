import type { ReactNode } from 'react'
import type { Streak } from '@/shared/domain/derive'
import { HeroHaze } from '@/shared/ui/HeroHaze'
import { StreakHero } from '@/shared/ui/StreakHero'
import { splitDuration } from '@/shared/utils/duration'
import { strings } from '@/shared/utils/strings'
import { useLaunchEntrance } from '../hooks/useLaunchEntrance'

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
  /** A line right under the hero, e.g. home's confirmations; its room is kept even when empty. */
  status?: ReactNode
  /** Blocks under the hero, composed by the app layer: dark cards, 10px apart. */
  children?: ReactNode
}

/** The home screen once a quit moment exists: the streak as elapsed time, live, out of the haze. */
export function StreakScreen({
  streak,
  brand,
  context,
  action,
  status,
  children,
}: StreakScreenProps) {
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
        {children ? (
          <>
            {/* The space between the hero and the blocks holds the status: filling it moves nothing. */}
            <div className="flex h-16 items-center justify-center px-6 text-center">{status}</div>
            <div className="flex flex-col gap-2.5 px-3 pb-4">{children}</div>
          </>
        ) : null}
      </div>
    </div>
  )
}
