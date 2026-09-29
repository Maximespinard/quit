import { Minus, Plus } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/shared/ui/base/button'
import { strings } from '@/shared/utils/strings'

type CountStepperProps = {
  value: number
  onChange: (value: number) => void
}

const copy = strings.lapse

/** How many cigarettes a lapse held: one by default, never fewer. One filet frame, like the segmented control. */
export function CountStepper({ value, onChange }: CountStepperProps) {
  const labelId = useId()

  return (
    <fieldset aria-labelledby={labelId} className="flex flex-col gap-3">
      <span id={labelId} className="text-label">
        {copy.countLabel}
      </span>
      <div className="flex h-12 items-center rounded-control border border-line bg-ghost">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={copy.fewer}
          disabled={value <= 1}
          onClick={() => onChange(value - 1)}
          className="disabled:bg-transparent"
        >
          <Minus aria-hidden="true" />
        </Button>
        <output aria-live="polite" className="flex-1 text-center font-medium text-cta tabular-nums">
          {value}
        </output>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={copy.more}
          onClick={() => onChange(value + 1)}
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>
    </fieldset>
  )
}
