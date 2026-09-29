import { type FormEvent, type ReactNode, useId, useState } from 'react'
import {
  CRAVING_INTENSITIES,
  type CravingInput,
  type CravingIntensity,
} from '@/shared/domain/facts/craving'
import { Button } from '@/shared/ui/base/button'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/base/toggle-group'
import { strings } from '@/shared/utils/strings'
import type { CravingTagOption } from '../domain/craving-tags'
import { CravingTagPicker } from './CravingTagPicker'

type CravingFormProps = {
  /** The tags to offer once the intensity is picked. */
  tagOptions: readonly CravingTagOption[]
  /** The craving being edited: its intensity and tags start picked. */
  initial?: Pick<CravingInput, 'intensity' | 'tags'> | undefined
  /** Returns whether the craving was recorded: once it is, the form locks against a second tap. */
  onSubmit: (intensity: CravingIntensity, tags: readonly string[]) => boolean
  /** Extra fields shown above the intensity, e.g. the backdated moment. */
  children?: ReactNode
}

/**
 * Rates a craving 1–3, then offers its tags, and submits it. No intensity is preselected: the
 * user picks one. Tags appear only once it is picked, and submitting without any is fine.
 */
export function CravingForm({ tagOptions, initial, onSubmit, children }: CravingFormProps) {
  const hintId = useId()
  const [intensity, setIntensity] = useState<CravingIntensity | null>(initial?.intensity ?? null)
  const [tags, setTags] = useState<readonly string[]>(initial?.tags ?? [])
  const [pending, setPending] = useState<string | null>(null)
  const [recorded, setRecorded] = useState(false)
  const copy = strings.craving.intensity

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (intensity === null || recorded) return
    const withPending = pending === null || tags.includes(pending) ? tags : [...tags, pending]
    setRecorded(onSubmit(intensity, withPending))
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      {children}
      <div className="flex flex-col gap-2">
        <span className="text-label">{copy.label}</span>
        <ToggleGroup
          aria-label={copy.label}
          aria-describedby={hintId}
          variant="outline"
          spacing={0}
          className="w-full"
          value={intensity === null ? [] : [String(intensity)]}
          onValueChange={(values: string[]) => {
            const picked = CRAVING_INTENSITIES.find((level) => String(level) === values[0])
            setIntensity(picked ?? null)
          }}
        >
          {CRAVING_INTENSITIES.map((level) => (
            <ToggleGroupItem key={level} value={String(level)}>
              {level}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p id={hintId} className="text-muted text-label">
          {copy.hint}
        </p>
      </div>
      {intensity !== null ? (
        <CravingTagPicker
          offered={tagOptions}
          value={tags}
          onValueChange={setTags}
          onPendingChange={setPending}
        />
      ) : null}
      {/* Stuck to the thumb zone: however many tags push it down, recording stays one tap away. */}
      <div className="sticky bottom-0 bg-linear-to-b from-transparent to-page to-40% pt-6 pb-safe-4">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={intensity === null || recorded}
        >
          {copy.submit}
        </Button>
      </div>
    </form>
  )
}
