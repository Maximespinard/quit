import { type FormEvent, type ReactNode, useId, useState } from 'react'
import { type LapseInput, type RecordLapseResult, recordLapse } from '@/shared/domain/facts/lapse'
import type { Journal } from '@/shared/domain/journal'
import { triggersRelapse } from '@/shared/domain/relapse'
import { Button } from '@/shared/ui/base/button'
import { Input } from '@/shared/ui/base/input'
import { Card } from '@/shared/ui/Card'
import { FormScreen } from '@/shared/ui/FormScreen'
import { ThumbZone } from '@/shared/ui/ThumbZone'
import { fromDatetimeLocal, toDatetimeLocal } from '@/shared/utils/datetime-local'
import { newFactId } from '@/shared/utils/fact-id'
import { strings } from '@/shared/utils/strings'
import { CountStepper } from './CountStepper'

type LapseFormProps = {
  journal: Journal
  /** Injected clock: the form never reads the system time itself. */
  now: number
  /** The lapse being edited, the journal then holding everything but it; absent to declare one. */
  initial?: LapseInput
  onRecorded: (journal: Journal) => void
  /** Under the primary action: the way out, and on a fact's page its deletion. */
  secondary?: ReactNode
}

type LapseError = Extract<RecordLapseResult, { ok: false }>['reason'] | 'invalid'

/**
 * Declares a lapse, now or backdated, with its cigarettes. Reaching this screen is the first
 * deliberate step; the explicit confirm button is the second, so a stray tap never logs one.
 * When the lapse would make a relapse, its cost is said before it lands.
 */
export function LapseForm({ journal, now, initial, onRecorded, secondary }: LapseFormProps) {
  const inputId = useId()
  const errorId = useId()
  const [value, setValue] = useState(() => toDatetimeLocal(initial?.at ?? now))
  // The field only shows minutes: left untouched it means now, or the edited lapse's instant,
  // to the millisecond.
  const [edited, setEdited] = useState(false)
  const [count, setCount] = useState(initial?.count ?? 1)
  const [error, setError] = useState<LapseError | null>(null)
  const copy = strings.lapse
  const at = edited ? fromDatetimeLocal(value) : (initial?.at ?? now)
  const relapse = at !== null && triggersRelapse(journal, at, now)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (at === null) {
      setError('invalid')
      return
    }
    const result = recordLapse(journal, { id: initial?.id ?? newFactId(), at, count }, now)
    if (result.ok) onRecorded(result.journal)
    else setError(result.reason)
  }

  return (
    <FormScreen title={initial ? copy.edit.title : copy.title} lead={copy.lead}>
      <form noValidate onSubmit={submit} className="flex flex-1 flex-col gap-5">
        <div className="flex flex-col gap-3">
          <label htmlFor={inputId} className="text-label">
            {copy.dateLabel}
          </label>
          <Input
            id={inputId}
            type="datetime-local"
            required
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setEdited(true)
              setError(null)
            }}
            aria-invalid={error !== null}
            aria-describedby={error !== null ? errorId : undefined}
          />
        </div>
        <CountStepper value={count} onChange={setCount} />
        <div aria-live="polite">
          {relapse ? (
            // Said, not sounded: a card like any other, never the alert colour.
            <Card className="gap-1.5">
              <p className="font-medium text-body">{copy.relapseTitle}</p>
              <p className="text-body text-muted">{copy.relapseCost}</p>
            </Card>
          ) : null}
        </div>
        {error !== null ? (
          <p id={errorId} role="alert" className="text-alert text-label">
            {copy[error]}
          </p>
        ) : null}
        <ThumbZone>
          <Button type="submit" size="lg">
            {initial ? copy.edit.confirm : copy.confirm}
          </Button>
        </ThumbZone>
        {secondary}
      </form>
    </FormScreen>
  )
}
