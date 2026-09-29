import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/shared/ui/base/button'
import { Input } from '@/shared/ui/base/input'
import { cn } from '@/shared/utils/cn'
import { strings } from '@/shared/utils/strings'
import type { DraftField, StepDraft } from '../utils/step-draft'
import type { StepStatus } from '../utils/step-status'

const copy = strings.protocol

/** A disabled place control fades out instead of taking the disabled fill, which reads as selected here. */
const placeControl = 'disabled:bg-transparent disabled:opacity-30'

/**
 * Every step sits on the same card, like every card in the world; its chip alone says where it
 * stands: the running step's cream chip, a past step's ghost chip over a muted title, upcoming
 * ones unmarked.
 */
const lookByStatus: Record<
  StepStatus,
  { title: string; mark: { label: string; tone: string } | null }
> = {
  current: { title: '', mark: { label: copy.status.current, tone: 'bg-ink text-page' } },
  past: { title: 'text-muted', mark: { label: copy.status.past, tone: 'bg-ghost text-muted' } },
  upcoming: { title: '', mark: null },
}

type StepFieldsProps = {
  draft: StepDraft
  /** Read from the protocol in force, so it stays put while the draft is edited. */
  status: StepStatus
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
  status,
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
  const look = lookByStatus[status]

  return (
    // No legend: WebKit lets a legend cut the card's border whatever its styling. The heading
    // names the group instead.
    <fieldset
      aria-labelledby={`${id}-title`}
      aria-describedby={look.mark === null ? undefined : `${id}-status`}
      className="flex min-w-0 flex-col gap-3 rounded-card bg-surface p-5"
    >
      <div className="-my-1 -mr-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 id={`${id}-title`} className={cn('font-medium text-body', look.title)}>
            {copy.step(number)}
          </h3>
          {look.mark === null ? null : (
            <span
              id={`${id}-status`}
              className={cn(
                'inline-flex h-6 items-center rounded-full px-2.5 font-medium text-detail',
                look.mark.tone,
              )}
            >
              {look.mark.label}
            </span>
          )}
        </div>
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
          <Input
            id={`${id}-dose`}
            inputMode="decimal"
            value={draft.dose}
            onChange={(event) => onChange('dose', event.target.value)}
            aria-invalid={invalid.dose}
            aria-describedby={describedBy(invalid.dose)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-duration`} className="text-label">
            {copy.durationLabel}
          </label>
          <Input
            id={`${id}-duration`}
            inputMode="numeric"
            value={draft.duration}
            onChange={(event) => onChange('duration', event.target.value)}
            aria-invalid={invalid.duration}
            aria-describedby={describedBy(invalid.duration)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-brand`} className="text-label">
          {copy.brandLabel}
        </label>
        <Input
          id={`${id}-brand`}
          value={draft.brand}
          autoComplete="off"
          onChange={(event) => onChange('brand', event.target.value)}
        />
      </div>
    </fieldset>
  )
}
