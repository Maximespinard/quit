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
  /** Resolves once the journal is stored: only then is the save confirmed. */
  onSaved: (journal: Journal) => Promise<void>
}

/** A numeric setting edited in place; nothing changes until a valid value is saved. */
export function ValueSetting({ label, input, value, apply, onSaved }: ValueSettingProps) {
  const inputId = useId()
  const errorId = useId()
  const inForce = value === null ? '' : input.toText(value)
  const [text, setText] = useState(inForce)
  const [status, setStatus] = useState<'editing' | 'saved' | 'refused'>('editing')

  const save = async () => {
    const read = input.read(text)
    const journal = apply(read)
    if (journal === null) {
      setStatus('refused')
      return
    }
    await onSaved(journal)
    // `35,5` is stored as 3550: the field shows it back as `35,50`, no longer a pending edit.
    setText(input.toText(read))
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
