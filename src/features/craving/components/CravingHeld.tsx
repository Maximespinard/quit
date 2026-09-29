import { useCountUp } from '@/shared/hooks/useCountUp'
import { HeroBackdrop } from '@/shared/ui/HeroBackdrop'
import { MINUTE_MS } from '@/shared/utils/duration'
import { strings } from '@/shared/utils/strings'
import { CRAVING_TIMER_MS } from '../domain/craving-timer'
import { MinuteSteps } from './MinuteSteps'

const TIMER_MINUTES = CRAVING_TIMER_MS / MINUTE_MS

/**
 * The celebration, in the streak hero's own language: the minutes held count up as one giant
 * figure and every minute step lands in sequence. Reduced motion shows the result at once.
 */
export function CravingHeld() {
  const shown = useCountUp(TIMER_MINUTES)
  const copy = strings.craving.held

  return (
    <div className="relative isolate overflow-hidden rounded-b-hero bg-page px-safe pt-safe text-ink">
      <HeroBackdrop />
      <div className="flex min-h-14 items-center pt-3">
        <h1 className="font-medium text-label">{strings.app.name}</h1>
      </div>
      <div className="flex flex-col items-center gap-1 pt-6 pb-9 text-center">
        <p className="text-display">
          <span className="sr-only">{TIMER_MINUTES} </span>
          <span aria-hidden="true">{shown}</span>
        </p>
        <span className="text-body">{copy.minutes}</span>
        <div className="mt-4 flex w-full justify-center">
          <MinuteSteps total={TIMER_MINUTES} held={TIMER_MINUTES} celebrate />
        </div>
      </div>
    </div>
  )
}
