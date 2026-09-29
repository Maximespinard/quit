import { type KeyboardEvent, useId, useState } from 'react'
import { Button } from '@/shared/ui/base/button'
import { Input } from '@/shared/ui/base/input'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/base/toggle-group'
import { strings } from '@/shared/utils/strings'
import { type CravingTagOption, resolveTypedTag } from '../domain/craving-tags'

type CravingTagPickerProps = {
  /** The defaults then the user's own tags, from past cravings. */
  offered: readonly CravingTagOption[]
  value: readonly string[]
  onValueChange: (tags: readonly string[]) => void
  /** The tag the field would add right now, or `null`: the form records it on submit. */
  onPendingChange: (tag: string | null) => void
}

/**
 * Optional tags for a craving: several can be pressed, and a typed one joins the list pressed.
 * A typed tag matching an offered one, case and spacing aside, presses that one instead.
 * Words typed without `Ajouter` are reported as pending and recorded with the craving. Leaving
 * the field changes nothing on screen: a tap on `Enregistrer` must land where the finger is.
 */
export function CravingTagPicker({
  offered,
  value,
  onValueChange,
  onPendingChange,
}: CravingTagPickerProps) {
  const labelId = useId()
  const hintId = useId()
  const inputId = useId()
  const [typed, setTyped] = useState('')
  const [added, setAdded] = useState<readonly CravingTagOption[]>([])
  const options = [...offered, ...added]
  const copy = strings.craving.tags

  const add = () => {
    const tag = resolveTypedTag(typed, options)
    if (tag === null) return
    if (!options.some((option) => option.tag === tag)) {
      setAdded([...added, { tag, label: tag }])
    }
    if (!value.includes(tag)) onValueChange([...value, tag])
    setTyped('')
    onPendingChange(null)
  }

  const type = (text: string) => {
    setTyped(text)
    onPendingChange(resolveTypedTag(text, options))
  }

  // Enter adds the tag rather than submitting the whole craving.
  const addOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    add()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <span id={labelId} className="text-label">
          {copy.label}
        </span>
        <ToggleGroup
          multiple
          aria-labelledby={labelId}
          aria-describedby={hintId}
          variant="outline"
          className="w-full flex-wrap"
          value={[...value]}
          onValueChange={(tags: string[]) => onValueChange(tags)}
        >
          {options.map((option) => (
            <ToggleGroupItem key={option.tag} value={option.tag} className="h-11">
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p id={hintId} className="text-muted text-label">
          {copy.hint}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-label">
          {copy.customLabel}
        </label>
        <div className="flex gap-2">
          <Input
            id={inputId}
            type="text"
            enterKeyHint="done"
            autoComplete="off"
            placeholder={copy.customPlaceholder}
            value={typed}
            onChange={(event) => type(event.target.value)}
            onKeyDown={addOnEnter}
            className="flex-1"
          />
          <Button type="button" variant="secondary" size="lg" onClick={add}>
            {copy.add}
          </Button>
        </div>
      </div>
    </div>
  )
}
