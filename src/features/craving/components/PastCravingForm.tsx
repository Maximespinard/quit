import { useId, useState } from 'react'
import { type CravingIntensity, recordCraving } from '@/shared/domain/facts/craving'
import type { Journal } from '@/shared/domain/journal'
import { fromDatetimeLocal, toDatetimeLocal } from '@/shared/utils/datetime-local'
import { strings } from '@/shared/utils/strings'
import { IntensityForm } from './IntensityForm'

type PastCravingFormProps = {
  journal: Journal
  /** Injected clock: the form never reads the system time itself. */
  now: number
  onRecorded: (journal: Journal) => void
}

/** Logs a craving after the fact, without the timer: never marked as held to the end. */
export function PastCravingForm({ journal, now, onRecorded }: PastCravingFormProps) {
  const inputId = useId()
  const errorId = useId()
  const [value, setValue] = useState(() => toDatetimeLocal(now))
  const [error, setError] = useState<'future' | 'invalid' | null>(null)
  const copy = strings.craving.past

  const record = (intensity: CravingIntensity) => {
    const at = fromDatetimeLocal(value)
    if (at === null) {
      setError('invalid')
      return false
    }
    const result = recordCraving(journal, { at, intensity, heldToEnd: false }, now)
    if (result.ok) onRecorded(result.journal)
    else setError(result.reason)
    return result.ok
  }

  return (
    <section className="flex flex-col gap-6 pt-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-title">{copy.title}</h2>
        <p className="text-body text-ink-soft">{copy.lead}</p>
      </div>
      <IntensityForm onSubmit={record}>
        <div className="flex flex-col gap-2">
          <label htmlFor={inputId} className="text-label">
            {copy.dateLabel}
          </label>
          <input
            id={inputId}
            type="datetime-local"
            required
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setError(null)
            }}
            aria-invalid={error !== null}
            aria-describedby={error !== null ? errorId : undefined}
            className="h-12 rounded-control border border-line bg-white px-4 font-medium text-cta text-ink"
          />
          {error !== null ? (
            <p id={errorId} role="alert" className="text-alert text-label">
              {copy[error]}
            </p>
          ) : null}
        </div>
      </IntensityForm>
    </section>
  )
}
