import { type FormEvent, useId, useState } from 'react'
import { recordPatchApplication } from '@/shared/domain/facts/patch-application'
import type { Journal } from '@/shared/domain/journal'
import { Button } from '@/shared/ui/base/button'
import { fromDatetimeLocal, toDatetimeLocal } from '@/shared/utils/datetime-local'
import { fromDecimalText, toDecimalText } from '@/shared/utils/decimal-text'
import { strings } from '@/shared/utils/strings'

const copy = strings.patch.form

const fieldClass =
  'h-12 w-full min-w-0 rounded-control border border-line bg-white px-4 font-medium text-cta text-ink tabular-nums'

type FormError = 'future' | 'before-quit-moment' | 'invalid-dose' | 'invalid'

type PatchApplicationFormProps = {
  journal: Journal
  /** The running step's dose, prefilled; `null` once the protocol is over. */
  stepDoseMg: number | null
  /** Injected clock: the form never reads the system time itself. */
  now: number
  onRecorded: (journal: Journal) => void
}

/** Logs one patch application with its own dose and time: the catch-up and the exception. */
export function PatchApplicationForm({
  journal,
  stepDoseMg,
  now,
  onRecorded,
}: PatchApplicationFormProps) {
  const id = useId()
  const errorId = `${id}-error`
  const [dose, setDose] = useState(() => (stepDoseMg === null ? '' : toDecimalText(stepDoseMg)))
  const [date, setDate] = useState(() => toDatetimeLocal(now))
  const [error, setError] = useState<FormError | null>(null)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const at = fromDatetimeLocal(date)
    if (at === null) {
      setError('invalid')
      return
    }
    const result = recordPatchApplication(journal, { at, doseMg: fromDecimalText(dose) }, now)
    if (result.ok) onRecorded(result.journal)
    else setError(result.reason)
  }

  const doseInvalid = error === 'invalid-dose'
  const dateInvalid = error !== null && !doseInvalid

  return (
    <section className="flex flex-col gap-6 pt-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-title">{copy.title}</h2>
        <p className="text-body text-ink-soft">{copy.lead}</p>
      </div>

      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-dose`} className="text-label">
            {copy.doseLabel}
          </label>
          <input
            id={`${id}-dose`}
            inputMode="decimal"
            value={dose}
            onChange={(event) => {
              setDose(event.target.value)
              setError(null)
            }}
            aria-invalid={doseInvalid}
            aria-describedby={doseInvalid ? errorId : undefined}
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-date`} className="text-label">
            {copy.dateLabel}
          </label>
          <input
            id={`${id}-date`}
            type="datetime-local"
            required
            value={date}
            onChange={(event) => {
              setDate(event.target.value)
              setError(null)
            }}
            aria-invalid={dateInvalid}
            aria-describedby={dateInvalid ? errorId : undefined}
            className={fieldClass}
          />
        </div>
        {error !== null ? (
          <p id={errorId} role="alert" className="text-alert text-label">
            {copy[error]}
          </p>
        ) : null}
        <Button type="submit" size="lg">
          {copy.submit}
        </Button>
      </form>
    </section>
  )
}
