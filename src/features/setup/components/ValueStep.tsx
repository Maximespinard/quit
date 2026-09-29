import { type FormEvent, useId, useState } from 'react'
import { Button } from '@/shared/ui/base/button'
import { strings } from '@/shared/utils/strings'
import type { ValueInput } from '../utils/value-inputs'
import { SetupQuestion } from './SetupQuestion'
import { ValueField } from './ValueField'

type ValueStepProps = {
  title: string
  lead: string
  input: ValueInput
  /** The value already given, when the user came back to this step. */
  initial: number | null
  onDone: (value: number) => void
}

/** A first-launch step asking for one number; an invalid one is refused before moving on. */
export function ValueStep({ title, lead, input, initial, onDone }: ValueStepProps) {
  const inputId = useId()
  const errorId = useId()
  const [text, setText] = useState(() => (initial === null ? '' : input.toText(initial)))
  const [refused, setRefused] = useState(false)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = input.read(text)
    if (input.isValid(value)) onDone(value)
    else setRefused(true)
  }

  return (
    // The form spans the whole step: its submit sits down in the thumb zone, under the field.
    <form noValidate onSubmit={submit} className="flex flex-1 flex-col">
      <SetupQuestion
        title={title}
        lead={lead}
        action={
          <Button type="submit" size="lg">
            {strings.firstLaunch.next}
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          <ValueField
            id={inputId}
            label={title}
            hideLabel
            prominent
            input={input}
            value={text}
            onChange={(value) => {
              setText(value)
              setRefused(false)
            }}
            errorId={refused ? errorId : null}
          />
          {refused ? (
            <p id={errorId} role="alert" className="text-alert text-label">
              {input.invalid}
            </p>
          ) : null}
        </div>
      </SetupQuestion>
    </form>
  )
}
