import { useNavigate } from '@tanstack/react-router'
import { CravingButton } from '@/shared/ui/CravingButton'
import { validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

type CravingLauncherProps = {
  /** The instant a tap starts the timer at: the injected clock, sandbox included. */
  now: number
}

/** The fixed `Envie` pill in the thumb zone: one tap starts the timer, nothing asked first. */
export function CravingLauncher({ now }: CravingLauncherProps) {
  const navigate = useNavigate()

  const start = () =>
    void navigate({
      to: '/craving/timer',
      search: (prev) => ({ ...validateAppSearch(prev), startedAt: now }),
    })

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
      <div className="mx-auto flex max-w-md justify-end px-safe pb-safe-4">
        <CravingButton
          label={strings.craving.launch}
          onClick={start}
          className="pointer-events-auto"
        />
      </div>
    </div>
  )
}
