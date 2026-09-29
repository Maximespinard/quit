import { useId } from 'react'
import { Input } from '@/shared/ui/base/input'
import { strings } from '@/shared/utils/strings'
import { SpecimenSection } from './SpecimenSection'

const t = strings.design.fields

/** The text field empty, filled, refused with its alert, and disabled. */
export function FieldsSpecimen() {
  const id = useId()

  return (
    <SpecimenSection title={strings.design.sections.fields}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <label htmlFor={`${id}-label`} className="text-label">
            {t.label}
          </label>
          <Input id={`${id}-label`} placeholder={t.placeholder} autoComplete="off" />
        </div>
        <div className="flex flex-col gap-3">
          <label htmlFor={`${id}-price`} className="text-label">
            {t.price}
          </label>
          <Input id={`${id}-price`} inputMode="decimal" defaultValue={t.priceValue} />
        </div>
        <div className="flex flex-col gap-3">
          <label htmlFor={`${id}-invalid`} className="text-label">
            {t.invalid}
          </label>
          <Input
            id={`${id}-invalid`}
            defaultValue={t.invalidValue}
            aria-invalid
            aria-describedby={`${id}-error`}
          />
          <p id={`${id}-error`} className="text-alert text-label">
            {t.error}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <label htmlFor={`${id}-disabled`} className="text-label">
            {t.disabled}
          </label>
          <Input id={`${id}-disabled`} defaultValue={t.disabledValue} disabled />
        </div>
      </div>
    </SpecimenSection>
  )
}
