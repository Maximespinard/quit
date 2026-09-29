import { type FormEvent, useId, useState } from 'react'
import { Button } from '@/shared/ui/base/button'
import { strings } from '@/shared/utils/strings'
import type { ValueInput } from '../utils/value-inputs'
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
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-title">{title}</h2>
        <p className="text-body text-muted">{lead}</p>
      </div>
      <form noValidate onSubmit={submit} className="flex flex-col gap-3">
        <ValueField
          id={inputId}
          label={title}
          hideLabel
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
        <Button type="submit" size="lg" className="mt-3">
          {strings.firstLaunch.next}
        </Button>
      </form>
    </section>
  )
}
