import { useId, useState } from 'react'
import {
  type CravingInput,
  type CravingIntensity,
  recordCraving,
} from '@/shared/domain/facts/craving'
import type { Journal } from '@/shared/domain/journal'
import { Input } from '@/shared/ui/base/input'
import { fromDatetimeLocal, toDatetimeLocal } from '@/shared/utils/datetime-local'
import { strings } from '@/shared/utils/strings'
import { tagOptions } from '../utils/tag-options'
import { CravingForm } from './CravingForm'

type PastCravingFormProps = {
  journal: Journal
  /** Injected clock: the form never reads the system time itself. */
  now: number
  /** The craving being edited, the journal then holding everything but it; absent to log one. */
  initial?: CravingInput
  onRecorded: (journal: Journal) => void
}

/**
 * Logs a craving after the fact, without the timer: never marked as held to the end. Editing
 * one keeps its held mark, and its exact instant while the date is left untouched.
 */
export function PastCravingForm({ journal, now, initial, onRecorded }: PastCravingFormProps) {
  const inputId = useId()
  const errorId = useId()
  const [value, setValue] = useState(() => toDatetimeLocal(initial?.at ?? now))
  const [edited, setEdited] = useState(false)
  const [error, setError] = useState<'future' | 'invalid' | null>(null)
  const copy = strings.craving.past

  const record = (intensity: CravingIntensity, tags: readonly string[]) => {
    const at = initial && !edited ? initial.at : fromDatetimeLocal(value)
    if (at === null) {
      setError('invalid')
      return false
    }
    const result = recordCraving(
      journal,
      { at, intensity, heldToEnd: initial?.heldToEnd ?? false, tags },
      now,
    )
    if (result.ok) onRecorded(result.journal)
    else setError(result.reason)
    return result.ok
  }

  return (
    <section className="flex flex-col gap-6 pt-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-title">{initial ? copy.edit.title : copy.title}</h2>
        <p className="text-body text-muted">{initial ? copy.edit.lead : copy.lead}</p>
      </div>
      <CravingForm
        tagOptions={tagOptions(journal, initial?.tags)}
        initial={initial}
        onSubmit={record}
      >
        <div className="flex flex-col gap-2">
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
          {error !== null ? (
            <p id={errorId} role="alert" className="text-alert text-label">
              {copy[error]}
            </p>
          ) : null}
        </div>
      </CravingForm>
    </section>
  )
}
