import { type FormEvent, type ReactNode, useId, useState } from 'react'
import { CRAVING_INTENSITIES, type CravingIntensity } from '@/shared/domain/facts/craving'
import { Button } from '@/shared/ui/base/button'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/base/toggle-group'
import { strings } from '@/shared/utils/strings'
import type { CravingTagOption } from '../domain/craving-tags'
import { CravingTagPicker } from './CravingTagPicker'

type CravingFormProps = {
  /** The tags to offer once the intensity is picked. */
  tagOptions: readonly CravingTagOption[]
  /** Returns whether the craving was recorded: once it is, the form locks against a second tap. */
  onSubmit: (intensity: CravingIntensity, tags: readonly string[]) => boolean
  /** Extra fields shown above the intensity, e.g. the backdated moment. */
  children?: ReactNode
}

/**
 * Rates a craving 1–3, then offers its tags, and submits it. No intensity is preselected: the
 * user picks one. Tags appear only once it is picked, and submitting without any is fine.
 */
export function CravingForm({ tagOptions, onSubmit, children }: CravingFormProps) {
  const hintId = useId()
  const [intensity, setIntensity] = useState<CravingIntensity | null>(null)
  const [tags, setTags] = useState<readonly string[]>([])
  const [recorded, setRecorded] = useState(false)
  const copy = strings.craving.intensity

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (intensity !== null && !recorded) setRecorded(onSubmit(intensity, tags))
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
        <p id={hintId} className="text-ink-soft text-label">
          {copy.hint}
        </p>
      </div>
      {intensity !== null ? (
        <CravingTagPicker offered={tagOptions} value={tags} onValueChange={setTags} />
      ) : null}
      <Button type="submit" size="lg" disabled={intensity === null || recorded}>
        {copy.submit}
      </Button>
    </form>
  )
}
