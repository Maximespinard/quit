import { useCountUp } from '@/shared/hooks/useCountUp'
import { TopBar } from '@/shared/ui/TopBar'
import { MINUTE_MS } from '@/shared/utils/duration'
import { strings } from '@/shared/utils/strings'
import { CRAVING_TIMER_MS } from '../domain/craving-timer'
import { CravingHaze } from './CravingHaze'
import { MinuteSteps } from './MinuteSteps'

const TIMER_MINUTES = CRAVING_TIMER_MS / MINUTE_MS

/**
 * The celebration, in the streak hero's own language over the timer's haze: the minutes held
 * count up as one giant figure and every minute step lands in sequence. The haze fades into the
 * page where the rating starts. Reduced motion shows the result at once, on a still haze.
 */
export function CravingHeld() {
  const shown = useCountUp(TIMER_MINUTES)
  const copy = strings.craving.held

  return (
    <div className="@container relative isolate overflow-hidden bg-page px-safe pt-safe text-ink">
      <CravingHaze />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-b from-transparent to-page"
      />
      <TopBar />
      <div className="flex flex-col items-center gap-3 pt-10 pb-12 text-center">
        <p className="text-display text-white">
          <span className="sr-only">{TIMER_MINUTES} </span>
          <span aria-hidden="true">{shown}</span>
        </p>
        <span className="text-lead">{copy.minutes}</span>
        <div className="mt-6 w-full">
          <MinuteSteps total={TIMER_MINUTES} held={TIMER_MINUTES} celebrate />
        </div>
      </div>
    </div>
  )
}
