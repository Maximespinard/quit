import { Button } from '@/shared/ui/base/button'
import { HeroBackdrop } from '@/shared/ui/HeroBackdrop'
import { MINUTE_MS } from '@/shared/utils/duration'
import { strings } from '@/shared/utils/strings'
import { CRAVING_TIMER_MS } from '../domain/craving-timer'
import { formatCountdown } from '../utils/format-countdown'
import { MinuteSteps } from './MinuteSteps'

type CravingTimerRunningProps = {
  remainingMs: number
  onStop: () => void
}

/**
 * The running timer: the whole screen becomes the night block, the countdown takes the one
 * giant figure, and `Arrêter` sits in the thumb zone. Nothing moves but the seconds.
 */
export function CravingTimerRunning({ remainingMs, onStop }: CravingTimerRunningProps) {
  const copy = strings.craving.timer
  const heldMinutes = Math.floor((CRAVING_TIMER_MS - remainingMs) / MINUTE_MS)

  return (
    <section
      aria-label={copy.region}
      className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-ink px-safe pt-safe text-on-ink"
    >
      <HeroBackdrop />
      <div className="flex min-h-14 items-center pt-3">
        <h1 className="font-semibold text-label">{strings.app.name}</h1>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-7 text-center">
        <p role="timer" aria-label={copy.remaining} className="text-display">
          {formatCountdown(remainingMs)}
        </p>
        <MinuteSteps total={CRAVING_TIMER_MS / MINUTE_MS} held={heldMinutes} />
        <p className="max-w-64 text-body text-on-ink/85">{copy.lead}</p>
      </div>
      <div className="pt-6 pb-safe-4">
        <Button
          variant="outline"
          size="lg"
          className="w-full border-on-ink/40 text-on-ink active:bg-on-ink/15"
          onClick={onStop}
        >
          {copy.stop}
        </Button>
      </div>
    </section>
  )
}
