import { type CravingIntensity, recordCraving } from '@/shared/domain/facts/craving'
import type { Journal } from '@/shared/domain/journal'
import { Button } from '@/shared/ui/base/button'
import { strings } from '@/shared/utils/strings'
import { CRAVING_TIMER_MS, cravingTimer } from '../domain/craving-timer'
import { formatCountdown } from '../utils/format-countdown'
import { IntensityForm } from './IntensityForm'

type CravingTimerScreenProps = {
  journal: Journal
  /** Injected clock: the remaining time derives from it and `startedAt` alone. */
  now: number
  startedAt: number
  /** When the user stopped the timer early, or `null` while it was left to run. */
  stoppedAt: number | null
  onStop: () => void
  onRecorded: (journal: Journal) => void
}

/**
 * The craving timer: counts down, then asks the intensity and records the craving.
 * Held to the end → celebration first; stopped early → recorded all the same, unmarked.
 */
export function CravingTimerScreen({
  journal,
  now,
  startedAt,
  stoppedAt,
  onStop,
  onRecorded,
}: CravingTimerScreenProps) {
  const { remainingMs, finished } = cravingTimer(startedAt, now)
  const copy = strings.craving
  const heldToEnd = stoppedAt === null && finished

  if (stoppedAt === null && !finished) {
    const elapsedShare = (CRAVING_TIMER_MS - remainingMs) / CRAVING_TIMER_MS
    return (
      <section
        aria-label={copy.timer.region}
        className="flex min-h-[70dvh] flex-col items-center justify-center gap-8 text-center"
      >
        <p className="max-w-64 text-body text-ink-soft">{copy.timer.lead}</p>
        <p role="timer" aria-label={copy.timer.remaining} className="text-figure">
          {formatCountdown(remainingMs)}
        </p>
        <div aria-hidden="true" className="h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-action transition-[width] duration-240 ease-out-expo motion-reduce:transition-none"
            style={{ width: `${elapsedShare * 100}%` }}
          />
        </div>
        <Button variant="outline" size="lg" className="w-full" onClick={onStop}>
          {copy.timer.stop}
        </Button>
      </section>
    )
  }

  const outcome = heldToEnd ? copy.held : copy.stopped
  const record = (intensity: CravingIntensity) => {
    const result = recordCraving(journal, { at: startedAt, intensity, heldToEnd }, now)
    if (result.ok) onRecorded(result.journal)
    return result.ok
  }

  return (
    <section className="flex flex-col gap-8 pt-6">
      <div className="flex flex-col gap-2 motion-safe:animate-step-in">
        <h2 className="text-title">{outcome.title}</h2>
        <p className="text-body text-ink-soft">{outcome.lead}</p>
      </div>
      <IntensityForm onSubmit={record} />
    </section>
  )
}
