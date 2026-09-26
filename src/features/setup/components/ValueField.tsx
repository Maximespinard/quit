import type { ValueInput } from '../utils/value-inputs'

type ValueFieldProps = {
  id: string
  label: string
  /** Visually hidden when the screen title already asks the question. */
  hideLabel?: boolean
  input: ValueInput
  value: string
  onChange: (value: string) => void
  /** Id of the alert that describes the refusal, when there is one. */
  errorId: string | null
}

/** One numeric setting as a text field: a French keyboard types `35,50`, never a spinner. */
export function ValueField({
  id,
  label,
  hideLabel = false,
  input,
  value,
  onChange,
  errorId,
}: ValueFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-label'}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode={input.inputMode}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={errorId !== null}
          aria-describedby={errorId ?? undefined}
          className="h-12 w-full rounded-control border border-line bg-white px-4 pr-10 font-medium text-cta text-ink tabular-nums"
        />
        {input.suffix !== undefined ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-medium text-cta text-ink-soft"
          >
            {input.suffix}
          </span>
        ) : null}
      </div>
    </div>
  )
}
