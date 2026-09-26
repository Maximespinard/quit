import { type FormEvent, useId, useState } from 'react'
import { quitMomentRefusal } from '@/shared/domain/facts/quit-moment'
import type { Journal } from '@/shared/domain/journal'
import { Button } from '@/shared/ui/base/button'
import { fromDatetimeLocal, toDatetimeLocal } from '@/shared/utils/datetime-local'
import { strings } from '@/shared/utils/strings'

type QuitMomentStepProps = {
  journal: Journal
  /** Injected clock: the step never reads the system time itself. */
  now: number
  /** The moment already picked, when the user came back to this step. */
  initial: number | null
  onPicked: (at: number) => void
}

const copy = strings.quitMoment

/** First launch, first step: the quit moment as "now" in one tap, or as any past date and time. */
export function QuitMomentStep({ journal, now, initial, onPicked }: QuitMomentStepProps) {
  const inputId = useId()
  const errorId = useId()
  const [value, setValue] = useState(() => toDatetimeLocal(initial ?? now))
  // A new journal holds no fact yet: only the future can be refused.
  const [error, setError] = useState<'future' | 'invalid' | null>(null)

  const pick = (at: number) => {
    if (quitMomentRefusal(journal, at, now) === null) onPicked(at)
    else setError('future')
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const at = fromDatetimeLocal(value)
    if (at === null) setError('invalid')
    else pick(at)
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-title">{copy.title}</h2>
        <p className="text-body text-ink-soft">{copy.lead}</p>
      </div>

      <Button size="lg" onClick={() => pick(now)}>
        {copy.now}
      </Button>

      <p className="text-center text-ink-soft text-label">{copy.or}</p>

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
        <Button type="submit" variant="secondary" size="lg">
          {copy.submit}
        </Button>
      </form>
    </section>
  )
}
