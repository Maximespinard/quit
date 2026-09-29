import { type FormEvent, type ReactNode, useId, useState } from 'react'
import type { Journal } from '@/shared/domain/journal'
import { Button } from '@/shared/ui/base/button'
import { Input } from '@/shared/ui/base/input'
import { formatDate, formatTime } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import {
  isChanged,
  type SettingsFields,
  type SettingsRefusals,
  saveSettings,
  settingsInForce,
} from '../utils/settings-form'
import { baselineInput, spendInput } from '../utils/value-inputs'
import { ValueField } from './ValueField'

type SettingsFormProps = {
  journal: Journal
  /** Injected clock: the form never reads the system time itself. */
  now: number
  /** Receives the journal holding every changed value; showing it saved is the caller's move. */
  onSaved: (journal: Journal) => void
}

type Field = keyof SettingsFields

type FieldGroupProps = {
  error: string | null
  errorId: string
  children: ReactNode
}

const copy = strings.settings

const quitMomentRefusalText = (refusal: NonNullable<SettingsRefusals['quitMoment']>) =>
  refusal.reason === 'invalid'
    ? strings.quitMoment.invalid
    : refusal.reason === 'future'
      ? strings.quitMoment.future
      : strings.quitMoment['after-facts'](
          formatDate(refusal.earliestFact),
          formatTime(refusal.earliestFact),
        )

/** A field with its refusal right under it, so each message sits by what it is about. */
function FieldGroup({ error, errorId, children }: FieldGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      {children}
      {error !== null ? (
        <p id={errorId} role="alert" className="text-alert text-label">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** Everything first launch asked, editable again under one save: all of it lands, or none. */
export function SettingsForm({ journal, now, onSaved }: SettingsFormProps) {
  const ids = { quitMoment: useId(), spend: useId(), baseline: useId() }
  const errorIds = { quitMoment: useId(), spend: useId(), baseline: useId() }
  const [inForce] = useState(() => settingsInForce(journal, now))
  const [fields, setFields] = useState(inForce)
  const [refusals, setRefusals] = useState<SettingsRefusals>({})

  const errors: Record<Field, string | null> = {
    quitMoment:
      refusals.quitMoment === undefined ? null : quitMomentRefusalText(refusals.quitMoment),
    spend: refusals.spend === undefined ? null : spendInput.invalid,
    baseline: refusals.baseline === undefined ? null : baselineInput.invalid,
  }
  const describedBy = (field: Field) => (errors[field] === null ? null : errorIds[field])

  const edit = (field: Field) => (value: string) => {
    setFields((current) => ({ ...current, [field]: value }))
    setRefusals(({ [field]: _, ...others }) => others)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = saveSettings(journal, inForce, fields, now)
    if (result.ok) onSaved(result.journal)
    else setRefusals(result.refusals)
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <FieldGroup error={errors.quitMoment} errorId={errorIds.quitMoment}>
        <div className="flex flex-col gap-3">
          <label htmlFor={ids.quitMoment} className="text-label">
            {copy.quitMoment.label}
          </label>
          <Input
            id={ids.quitMoment}
            type="datetime-local"
            required
            value={fields.quitMoment}
            onChange={(event) => edit('quitMoment')(event.target.value)}
            aria-invalid={errors.quitMoment !== null}
            aria-describedby={describedBy('quitMoment') ?? undefined}
          />
        </div>
      </FieldGroup>
      <FieldGroup error={errors.spend} errorId={errorIds.spend}>
        <ValueField
          id={ids.spend}
          label={copy.spend.label}
          input={spendInput}
          value={fields.spend}
          placeholder={copy.unset}
          onChange={edit('spend')}
          errorId={describedBy('spend')}
        />
      </FieldGroup>
      <FieldGroup error={errors.baseline} errorId={errorIds.baseline}>
        <ValueField
          id={ids.baseline}
          label={copy.baseline.label}
          input={baselineInput}
          value={fields.baseline}
          placeholder={copy.unset}
          onChange={edit('baseline')}
          errorId={describedBy('baseline')}
        />
      </FieldGroup>
      <Button type="submit" size="lg" disabled={!isChanged(inForce, fields)}>
        {copy.save}
      </Button>
    </form>
  )
}
