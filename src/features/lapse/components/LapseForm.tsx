import { type FormEvent, useId, useState } from 'react'
import { recordLapse } from '@/shared/domain/facts/lapse'
import type { Journal } from '@/shared/domain/journal'
import { Button } from '@/shared/ui/base/button'
import { fromDatetimeLocal, toDatetimeLocal } from '@/shared/utils/datetime-local'
import { strings } from '@/shared/utils/strings'

type LapseFormProps = {
  journal: Journal
  /** Injected clock: the form never reads the system time itself. */
  now: number
  onRecorded: (journal: Journal) => void
}

type LapseError = 'future' | 'before-quit-moment' | 'invalid'

/**
 * Declares a lapse, now or backdated. Reaching this screen is the first deliberate step;
 * the explicit confirm button is the second, so a stray tap never logs one.
 */
export function LapseForm({ journal, now, onRecorded }: LapseFormProps) {
  const inputId = useId()
  const errorId = useId()
  const [value, setValue] = useState(() => toDatetimeLocal(now))
  const [error, setError] = useState<LapseError | null>(null)
  const copy = strings.lapse

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const at = fromDatetimeLocal(value)
    if (at === null) {
      setError('invalid')
      return
    }
    const result = recordLapse(journal, at, now)
    if (result.ok) onRecorded(result.journal)
    else setError(result.reason)
  }

  return (
    <section className="flex flex-col gap-6 pt-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-title">{copy.title}</h2>
        <p className="text-body text-ink-soft">{copy.lead}</p>
      </div>
      <form noValidate onSubmit={submit} className="flex flex-col gap-3">
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
        <Button type="submit" size="lg">
          {copy.confirm}
        </Button>
      </form>
    </section>
  )
}
