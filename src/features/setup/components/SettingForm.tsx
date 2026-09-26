import type { FormEvent, ReactNode } from 'react'
import { useId } from 'react'
import { Button } from '@/shared/ui/base/button'
import { strings } from '@/shared/utils/strings'

type SettingFormProps = {
  label: string
  /** The value in force, as a sentence; `null` when it was never set. */
  current: string | null
  saved: boolean
  onSubmit: () => void
  children: ReactNode
}

const copy = strings.settings

/** One setting as its own small form: what is in force, the field, save, and a quiet confirmation. */
export function SettingForm({ label, current, saved, onSubmit, children }: SettingFormProps) {
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
      className="flex flex-col gap-3 rounded-card bg-surface p-4"
    >
      <div className="flex flex-col gap-1">
        <h3 id={titleId} className="font-semibold text-body">
          {label}
        </h3>
        <p className="text-ink-dim text-label">{current ?? copy.unset}</p>
      </div>
      {children}
      <div className="flex items-center gap-3">
        <Button type="submit" variant="outline" className="active:bg-surface-locked">
          {copy.save}
        </Button>
        <p role="status" className="text-ink-soft text-label">
          {saved ? copy.saved : null}
        </p>
      </div>
    </form>
  )
}
