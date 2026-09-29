import { GOAL_LABEL_MAX_LENGTH } from '@quit/contract/settings'
import { type FormEvent, type ReactNode, useId, useState } from 'react'
import type { GoalProgress } from '@/shared/domain/derive'
import { type SetGoalResult, setGoal } from '@/shared/domain/goal'
import type { Journal } from '@/shared/domain/journal'
import { Button } from '@/shared/ui/base/button'
import { Input } from '@/shared/ui/base/input'
import { FormScreen } from '@/shared/ui/FormScreen'
import { ThumbZone } from '@/shared/ui/ThumbZone'
import { fromEuroText, toEuroText } from '@/shared/utils/euros'
import { strings } from '@/shared/utils/strings'

type GoalFormProps = {
  journal: Journal
  /** Injected clock: replacing a goal reached starts the next one from here. */
  now: number
  /** The goal in force: one still to reach is edited, one reached is replaced from blank. */
  goal: GoalProgress | null
  onSaved: (journal: Journal) => void
  /** Under the primary action: the way out. */
  secondary?: ReactNode
}

type Refusal = Extract<SetGoalResult, { ok: false }>['reason']

const copy = strings.goal.form

/** Names the one thing to save for and its price. */
export function GoalForm({ journal, now, goal, onSaved, secondary }: GoalFormProps) {
  const replacesReached = goal?.reached === true
  const initial = goal === null || replacesReached ? null : goal
  const labelId = useId()
  const priceId = useId()
  const errorId = useId()
  const [label, setLabel] = useState(initial?.label ?? '')
  const [price, setPrice] = useState(initial === null ? '' : toEuroText(initial.priceCents))
  const [refusal, setRefusal] = useState<Refusal | null>(null)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Unreadable euros read as `NaN`: the domain refuses them like any invalid price.
    const result = setGoal(journal, { label, priceCents: fromEuroText(price) ?? Number.NaN }, now)
    if (result.ok) onSaved(result.journal)
    else setRefusal(result.reason)
  }

  return (
    <FormScreen title={copy.title} lead={replacesReached ? copy.restart : copy.lead}>
      <form noValidate onSubmit={submit} className="flex flex-1 flex-col gap-5">
        <div className="flex flex-col gap-3">
          <label htmlFor={labelId} className="text-label">
            {copy.label}
          </label>
          <Input
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
          />
        </div>
        <div className="flex flex-col gap-3">
          <label htmlFor={priceId} className="text-label">
            {copy.price}
          </label>
          <div className="relative">
            <Input
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
              className="pr-10"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-medium text-cta text-muted"
            >
              {copy.suffix}
            </span>
          </div>
        </div>
        {refusal !== null ? (
          <p id={errorId} role="alert" className="text-alert text-label">
            {refusal === 'invalid-label'
              ? copy['invalid-label'](GOAL_LABEL_MAX_LENGTH)
              : copy['invalid-price']}
          </p>
        ) : null}
        <ThumbZone secondary={secondary}>
          <Button type="submit" size="lg">
            {copy.submit}
          </Button>
        </ThumbZone>
      </form>
    </FormScreen>
  )
}
