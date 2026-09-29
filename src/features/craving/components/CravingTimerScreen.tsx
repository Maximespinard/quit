import type { CravingIntensity } from '@quit/contract/facts'
import { recordCraving } from '@/shared/domain/facts/craving'
import type { Journal } from '@/shared/domain/journal'
import { newFactId } from '@/shared/utils/fact-id'
import { strings } from '@/shared/utils/strings'
import { cravingTimer } from '../domain/craving-timer'
import { tagOptions } from '../utils/tag-options'
import { CravingForm } from './CravingForm'
import { CravingHeld } from './CravingHeld'
import { CravingTimerRunning } from './CravingTimerRunning'
import { CravingTopBar } from './CravingTopBar'

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
 * The craving timer: counts down, then asks the intensity and the tags, and records the craving.
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
  const heldToEnd = stoppedAt === null && finished

  if (stoppedAt === null && !finished) {
    return (
      <div className="mx-auto max-w-md">
        <CravingTimerRunning remainingMs={remainingMs} onStop={onStop} />
      </div>
    )
  }

  const record = (intensity: CravingIntensity, tags: readonly string[]) => {
    const result = recordCraving(
      journal,
      { id: newFactId(), at: startedAt, intensity, heldToEnd, tags },
      now,
    )
    if (result.ok) onRecorded(result.journal)
    return result.ok
  }

  const outcome = heldToEnd ? strings.craving.held : strings.craving.stopped
  const rating = (
    <section className="flex flex-col gap-8 pt-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-title">{outcome.title}</h2>
        <p className="text-body text-muted">{outcome.lead}</p>
      </div>
      <CravingForm tagOptions={tagOptions(journal)} onSubmit={record} />
    </section>
  )

  if (!heldToEnd) {
    return (
      <div className="mx-auto max-w-md px-safe pt-safe">
        <CravingTopBar />
        {rating}
      </div>
    )
  }
  return (
    <div className="mx-auto max-w-md">
      <CravingHeld />
      <div className="px-safe">{rating}</div>
    </div>
  )
}
