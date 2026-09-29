import { useId } from 'react'
import { Input } from '@/shared/ui/base/input'
import { strings } from '@/shared/utils/strings'
import { SPECIMEN_FIELDS } from '../utils/specimen-data'
import { SpecimenSection } from './SpecimenSection'

/** The text field in each of its states: empty, filled, refused with its alert, disabled. */
export function FieldsSpecimen() {
  const baseId = useId()

  return (
    <SpecimenSection title={strings.design.sections.fields}>
      <div className="flex flex-col gap-5">
        {SPECIMEN_FIELDS.map((field) => {
          const fieldId = `${baseId}-${field.id}`
          const error = 'error' in field ? field.error : null
          return (
            <div key={field.id} className="flex flex-col gap-3">
              <label htmlFor={fieldId} className="text-label">
                {field.label}
              </label>
              <Input
                id={fieldId}
                autoComplete="off"
                placeholder={'placeholder' in field ? field.placeholder : undefined}
                defaultValue={'value' in field ? field.value : undefined}
                disabled={'disabled' in field}
                aria-invalid={error !== null}
                aria-describedby={error === null ? undefined : `${fieldId}-error`}
              />
              {error === null ? null : (
                <p id={`${fieldId}-error`} className="text-alert text-label">
                  {error}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </SpecimenSection>
  )
}
