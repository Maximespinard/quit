import { useId, useState } from 'react'
import {
  latestQuitMoment,
  type QuitMomentRefusal,
  recordQuitMoment,
} from '@/shared/domain/facts/quit-moment'
import type { Journal } from '@/shared/domain/journal'
import { fromDatetimeLocal, toDatetimeLocal } from '@/shared/utils/datetime-local'
import { formatDate, formatTime } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import { SettingForm } from './SettingForm'

type QuitMomentSettingProps = {
  journal: Journal
  /** Injected clock: the setting never reads the system time itself. */
  now: number
  onSaved: (journal: Journal) => void
}

type Status =
  | { readonly kind: 'editing' | 'saved' | 'invalid' }
  | { readonly kind: 'refused'; readonly refusal: QuitMomentRefusal }

const copy = strings.quitMoment

const refusalText = (refusal: QuitMomentRefusal) =>
  refusal.reason === 'future'
    ? copy.future
    : copy['after-facts'](formatDate(refusal.earliestFact), formatTime(refusal.earliestFact))

/** Corrects the quit moment: earlier is always fine, later only up to the first fact recorded. */
export function QuitMomentSetting({ journal, now, onSaved }: QuitMomentSettingProps) {
  const inputId = useId()
  const errorId = useId()
  const quitMoment = latestQuitMoment(journal)
  const [value, setValue] = useState(() => toDatetimeLocal(quitMoment ?? now))
  const [status, setStatus] = useState<Status>({ kind: 'editing' })
  const error =
    status.kind === 'invalid'
      ? copy.invalid
      : status.kind === 'refused'
        ? refusalText(status.refusal)
        : null

  const save = () => {
    // The field only shows minutes: left untouched, it keeps the moment to the millisecond.
    const at =
      quitMoment !== null && value === toDatetimeLocal(quitMoment)
        ? quitMoment
        : fromDatetimeLocal(value)
    if (at === null) {
      setStatus({ kind: 'invalid' })
      return
    }
    const result = recordQuitMoment(journal, at, now)
    if (!result.ok) {
      const { ok: _, ...refusal } = result
      setStatus({ kind: 'refused', refusal })
      return
    }
    onSaved(result.journal)
    setStatus({ kind: 'saved' })
  }

  return (
    <SettingForm
      label={strings.settings.quitMoment.label}
      current={
        quitMoment === null
          ? null
          : strings.settings.quitMoment.current(formatDate(quitMoment), formatTime(quitMoment))
      }
      saved={status.kind === 'saved'}
      onSubmit={save}
    >
      <label htmlFor={inputId} className="sr-only">
        {strings.settings.quitMoment.label}
      </label>
      <input
        id={inputId}
        type="datetime-local"
        required
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          setStatus({ kind: 'editing' })
        }}
        aria-invalid={error !== null}
        aria-describedby={error !== null ? errorId : undefined}
        className="h-12 rounded-control border border-line bg-white px-4 font-medium text-cta text-ink"
      />
      {error !== null ? (
        <p id={errorId} role="alert" className="text-alert text-label">
          {error}
        </p>
      ) : null}
    </SettingForm>
  )
}
