import { type FormEvent, useId, useState } from 'react'
import { GOAL_LABEL_MAX_LENGTH, type SetGoalResult, setGoal } from '@/shared/domain/goal'
import type { Journal } from '@/shared/domain/journal'
import { Button } from '@/shared/ui/base/button'
import { fromEuroText, toEuroText } from '@/shared/utils/euros'
import { strings } from '@/shared/utils/strings'

type GoalFormProps = {
  journal: Journal
  /** Injected clock: replacing a goal reached starts the next one from here. */
  now: number
  /** The goal in force, when it is still to reach: the form edits it. Absent, it starts blank. */
  initial?: { readonly label: string; readonly priceCents: number }
  /** Whether the goal in force is reached: the next one then starts again from zero. */
  replacesReached: boolean
  onSaved: (journal: Journal) => void
}

type Refusal = Extract<SetGoalResult, { ok: false }>['reason']

const copy = strings.goal.form

const fieldClass =
  'h-12 w-full rounded-control border border-line bg-white px-4 font-medium text-cta text-ink placeholder:font-normal placeholder:text-ink-soft'

/** Names the one thing to save for and its price. */
export function GoalForm({ journal, now, initial, replacesReached, onSaved }: GoalFormProps) {
  const labelId = useId()
  const priceId = useId()
  const errorId = useId()
  const [label, setLabel] = useState(initial?.label ?? '')
  const [price, setPrice] = useState(initial === undefined ? '' : toEuroText(initial.priceCents))
  const [refusal, setRefusal] = useState<Refusal | null>(null)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Unreadable euros read as `NaN`: the domain refuses them like any invalid price.
    const result = setGoal(journal, { label, priceCents: fromEuroText(price) ?? Number.NaN }, now)
    if (result.ok) onSaved(result.journal)
    else setRefusal(result.reason)
  }

  return (
    <section className="flex flex-col gap-6 pt-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-title">{copy.title}</h2>
        <p className="text-body text-ink-soft">{replacesReached ? copy.restart : copy.lead}</p>
      </div>
      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <label htmlFor={labelId} className="text-label">
            {copy.label}
          </label>
          <input
            id={labelId}
            type="text"
            autoComplete="off"
            maxLength={GOAL_LABEL_MAX_LENGTH}
            value={label}
            placeholder={copy.labelPlaceholder}
            onChange={(event) => {
              setLabel(event.target.value)
              setRefusal(null)
            }}
            aria-invalid={refusal === 'invalid-label'}
            aria-describedby={refusal === 'invalid-label' ? errorId : undefined}
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-3">
          <label htmlFor={priceId} className="text-label">
            {copy.price}
          </label>
          <div className="relative">
            <input
              id={priceId}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={price}
              onChange={(event) => {
                setPrice(event.target.value)
                setRefusal(null)
              }}
              aria-invalid={refusal === 'invalid-price'}
              aria-describedby={refusal === 'invalid-price' ? errorId : undefined}
              className={`${fieldClass} pr-10 tabular-nums`}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-medium text-cta text-ink-soft"
            >
              {strings.settings.spend.suffix}
            </span>
          </div>
        </div>
        {refusal !== null ? (
          <p id={errorId} role="alert" className="text-alert text-label">
            {copy[refusal]}
          </p>
        ) : null}
        <Button type="submit" size="lg">
          {copy.submit}
        </Button>
      </form>
    </section>
  )
}
