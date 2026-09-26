import { useId, useState } from 'react'
import type { Journal } from '@/shared/domain/journal'
import { strings } from '@/shared/utils/strings'
import type { ValueInput } from '../utils/value-inputs'
import { SettingForm } from './SettingForm'
import { ValueField } from './ValueField'

type ValueSettingProps = {
  label: string
  input: ValueInput
  /** The value in force, `null` when first launch predates the setting. */
  value: number | null
  /** The journal with the new value, or `null` when the domain refuses it. */
  apply: (value: number) => Journal | null
  onSaved: (journal: Journal) => void
}

/** A numeric setting edited in place; nothing changes until a valid value is saved. */
export function ValueSetting({ label, input, value, apply, onSaved }: ValueSettingProps) {
  const inputId = useId()
  const errorId = useId()
  const inForce = value === null ? '' : input.toText(value)
  const [text, setText] = useState(inForce)
  const [status, setStatus] = useState<'editing' | 'saved' | 'refused'>('editing')

  const save = () => {
    const journal = apply(input.read(text))
    if (journal === null) {
      setStatus('refused')
      return
    }
    onSaved(journal)
    setStatus('saved')
  }

  return (
    <SettingForm
      label={label}
      changed={text !== inForce}
      saved={status === 'saved'}
      onSubmit={save}
    >
      <ValueField
        id={inputId}
        label={label}
        hideLabel
        input={input}
        value={text}
        placeholder={strings.settings.unset}
        onChange={(next) => {
          setText(next)
          setStatus('editing')
        }}
        errorId={status === 'refused' ? errorId : null}
      />
      {status === 'refused' ? (
        <p id={errorId} role="alert" className="text-alert text-label">
          {input.invalid}
        </p>
      ) : null}
    </SettingForm>
  )
}
