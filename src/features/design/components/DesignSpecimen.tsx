import { CravingButton } from '@/shared/ui/CravingButton'
import { strings } from '@/shared/utils/strings'
import { ControlsSpecimen } from './ControlsSpecimen'
import { FieldsSpecimen } from './FieldsSpecimen'
import { HomeSpecimen } from './HomeSpecimen'
import { NavigationSpecimen } from './NavigationSpecimen'
import { TokenReference } from './TokenReference'

/** Hidden route /design: the home screen as first viewport, then every reusable piece. */
export function DesignSpecimen() {
  return (
    <>
      <div className="mx-auto flex max-w-md flex-col pb-32">
        <HomeSpecimen />
        <div className="flex flex-col gap-8 px-safe pt-10">
          {/* The fixed Envie pill may cover scrolling content, never this disclosure. */}
          <p className="max-w-[64%] text-muted text-label">{strings.design.synthetic}</p>
          <NavigationSpecimen />
          <ControlsSpecimen />
          <FieldsSpecimen />
          <TokenReference />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0">
        <div className="mx-auto flex max-w-md justify-end px-safe pb-safe-4">
          <CravingButton label={strings.craving.launch} />
        </div>
      </div>
    </>
  )
}
