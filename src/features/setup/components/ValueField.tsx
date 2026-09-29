import { Input } from '@/shared/ui/base/input'
import { cn } from '@/shared/utils/cn'
import type { ValueInput } from '../utils/value-inputs'

type ValueFieldProps = {
  id: string
  label: string
  /** Visually hidden when the screen title already asks the question. */
  hideLabel?: boolean
  /** The step's one answer: typed as a white key figure, not as a form value. */
  prominent?: boolean
  input: ValueInput
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Id of the alert that describes the refusal, when there is one. */
  errorId: string | null
}

/** One numeric setting as a text field: a French keyboard types `35,50`, never a spinner. */
export function ValueField({
  id,
  label,
  hideLabel = false,
  prominent = false,
  input,
  value,
  onChange,
  placeholder,
  errorId,
}: ValueFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-label'}>
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode={input.inputMode}
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={errorId !== null}
          aria-describedby={errorId ?? undefined}
          className={cn('pr-10', prominent && 'h-16 pr-14 text-figure text-white')}
        />
        {input.suffix !== undefined ? (
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-y-0 right-4 flex items-center font-medium text-cta text-muted',
              prominent && 'right-5 text-figure',
            )}
          >
            {input.suffix}
          </span>
        ) : null}
      </div>
    </div>
  )
}
