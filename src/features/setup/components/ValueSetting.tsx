import { useId, useState } from 'react'
import type { Journal } from '@/shared/domain/journal'
import type { ValueInput } from '../utils/value-inputs'
import { SettingForm } from './SettingForm'
import { ValueField } from './ValueField'

type ValueSettingProps = {
  label: string
  input: ValueInput
  /** The value in force, `null` when first launch predates the setting. */
  value: number | null
  /** How the value in force reads as a sentence. */
  describe: (value: number) => string
  /** The journal with the new value, or `null` when the domain refuses it. */
  apply: (value: number) => Journal | null
  onSaved: (journal: Journal) => void
}

/** A numeric setting edited in place; nothing changes until a valid value is saved. */
export function ValueSetting({ label, input, value, describe, apply, onSaved }: ValueSettingProps) {
  const inputId = useId()
  const errorId = useId()
  const [text, setText] = useState(() => (value === null ? '' : input.toText(value)))
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
      current={value === null ? null : describe(value)}
      saved={status === 'saved'}
      onSubmit={save}
    >
      <ValueField
        id={inputId}
        label={label}
        hideLabel
        input={input}
        value={text}
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
