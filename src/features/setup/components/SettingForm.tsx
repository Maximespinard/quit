import type { FormEvent, ReactNode } from 'react'
import { useId } from 'react'
import { Button } from '@/shared/ui/base/button'
import { strings } from '@/shared/utils/strings'

type SettingFormProps = {
  label: string
  /** Whether the field differs from what is in force: saving the same value is no action. */
  changed: boolean
  saved: boolean
  onSubmit: () => void
  children: ReactNode
}

const copy = strings.settings

/** One setting as its own small form: the field holds what is in force; save wakes on a change. */
export function SettingForm({ label, changed, saved, onSubmit, children }: SettingFormProps) {
  const titleId = useId()

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form
      noValidate
      aria-labelledby={titleId}
      onSubmit={submit}
      className="flex flex-col gap-2.5 rounded-card bg-surface p-4"
    >
      <h3 id={titleId} className="font-semibold text-body">
        {label}
      </h3>
      {children}
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={!changed}>
          {copy.save}
        </Button>
        <p role="status" className="text-ink-soft text-label">
          {saved ? copy.saved : null}
        </p>
      </div>
    </form>
  )
}
