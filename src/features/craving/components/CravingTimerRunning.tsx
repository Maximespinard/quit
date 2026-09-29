import { useId } from 'react'
import { Button } from '@/shared/ui/base/button'
import { MINUTE_MS } from '@/shared/utils/duration'
import { strings } from '@/shared/utils/strings'
import { CRAVING_TIMER_MS } from '../domain/craving-timer'
import { formatCountdown } from '../utils/format-countdown'
import { CravingHaze } from './CravingHaze'
import { CravingTopBar } from './CravingTopBar'
import { MinuteSteps } from './MinuteSteps'

type CravingTimerRunningProps = {
  remainingMs: number
  onStop: () => void
}

/**
 * The running timer: the screen turns to slow moss and bronze around one white countdown,
 * and `Arrêter` sits in the thumb zone. Only the seconds and the haze move.
 */
export function CravingTimerRunning({ remainingMs, onStop }: CravingTimerRunningProps) {
  const labelId = useId()
  const regionId = useId()
  const copy = strings.craving.timer
  const heldMinutes = Math.floor((CRAVING_TIMER_MS - remainingMs) / MINUTE_MS)

  return (
    <section
      aria-labelledby={regionId}
      className="@container relative isolate flex min-h-dvh flex-col overflow-hidden bg-page px-safe pt-safe text-ink"
    >
      <CravingHaze />
      <CravingTopBar
        context={
          <span id={regionId} className="text-label">
            {copy.region}
          </span>
        }
      />
      <div className="flex flex-1 flex-col justify-center gap-6 py-8">
        <p className="max-w-[15ch] text-balance text-[1.5rem] leading-[1.2] tracking-[-0.025em]">
          {copy.lead}
        </p>
        <div className="flex flex-col gap-3">
          <p
            role="timer"
            aria-labelledby={labelId}
            className="font-medium text-[33cqi] text-white leading-[0.86] tracking-[-0.05em]"
          >
            {formatCountdown(remainingMs)}
          </p>
          <span id={labelId} className="text-label">
            {copy.remaining}
          </span>
        </div>
        <MinuteSteps total={CRAVING_TIMER_MS / MINUTE_MS} held={heldMinutes} />
      </div>
      <div className="pt-6 pb-safe-4">
        <Button variant="secondary" size="lg" className="w-full" onClick={onStop}>
          {copy.stop}
        </Button>
      </div>
    </section>
  )
}
