import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/shared/ui/base/button'
import { strings } from '@/shared/utils/strings'
import type { DraftField, StepDraft } from '../utils/step-draft'

const copy = strings.protocol

/** A disabled place control fades out instead of taking the disabled fill, which reads as selected here. */
const placeControl = 'disabled:bg-transparent disabled:opacity-30'

const fieldClass =
  'h-12 w-full min-w-0 rounded-control border border-line bg-white px-4 font-medium text-cta text-ink tabular-nums'

type StepFieldsProps = {
  draft: StepDraft
  /** 1-based position in the protocol. */
  number: number
  isFirst: boolean
  isLast: boolean
  /** The protocol never goes below one step. */
  canRemove: boolean
  /** Set after a refused save: which of this step's numbers the domain rejected. */
  invalid: { dose: boolean; duration: boolean }
  errorId: string
  onChange: (field: DraftField, value: string) => void
  onMove: (offset: -1 | 1) => void
  onRemove: () => void
}

/** One step of the protocol editor: dose, duration, brand, and its place in the list. */
export function StepFields({
  draft,
  number,
  isFirst,
  isLast,
  canRemove,
  invalid,
  errorId,
  onChange,
  onMove,
  onRemove,
}: StepFieldsProps) {
  const id = useId()
  const describedBy = (isInvalid: boolean) => (isInvalid ? errorId : undefined)

  return (
    // No legend: WebKit lets a legend cut the card's border whatever its styling. The heading
    // names the group instead.
    <fieldset
      aria-labelledby={`${id}-title`}
      className="flex min-w-0 flex-col gap-3 rounded-card border border-line p-4"
    >
      <div className="-my-1 -mr-2 flex items-center justify-between">
        <h3 id={`${id}-title`} className="font-semibold text-body">
          {copy.step(number)}
        </h3>
        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            className={placeControl}
            aria-label={copy.moveUp(number)}
            disabled={isFirst}
            onClick={() => onMove(-1)}
          >
            <ChevronUp strokeWidth={1.75} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={placeControl}
            aria-label={copy.moveDown(number)}
            disabled={isLast}
            onClick={() => onMove(1)}
          >
            <ChevronDown strokeWidth={1.75} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={placeControl}
            aria-label={copy.remove(number)}
            disabled={!canRemove}
            onClick={onRemove}
          >
            <Trash2 strokeWidth={1.75} aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-dose`} className="text-label">
            {copy.doseLabel}
          </label>
          <input
            id={`${id}-dose`}
            inputMode="decimal"
            value={draft.dose}
            onChange={(event) => onChange('dose', event.target.value)}
            aria-invalid={invalid.dose}
            aria-describedby={describedBy(invalid.dose)}
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-duration`} className="text-label">
            {copy.durationLabel}
          </label>
          <input
            id={`${id}-duration`}
            inputMode="numeric"
            value={draft.duration}
            onChange={(event) => onChange('duration', event.target.value)}
            aria-invalid={invalid.duration}
            aria-describedby={describedBy(invalid.duration)}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-brand`} className="text-label">
          {copy.brandLabel}
        </label>
        <input
          id={`${id}-brand`}
          value={draft.brand}
          autoComplete="off"
          onChange={(event) => onChange('brand', event.target.value)}
          className={fieldClass}
        />
      </div>
    </fieldset>
  )
}
