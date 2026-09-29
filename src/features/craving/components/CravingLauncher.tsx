import { useNavigate } from '@tanstack/react-router'
import { latestQuitMoment } from '@/shared/domain/facts/quit-moment'
import type { Journal } from '@/shared/domain/journal'
import { CravingButton } from '@/shared/ui/CravingButton'
import { validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

type CravingLauncherProps = {
  /** Envie waits for the journey: before first launch, there is no craving to hold yet. */
  journal: Journal
  /** The instant a tap starts the timer at: the injected clock, sandbox included. */
  now: number
}

/**
 * The fixed `Envie` pill under the right thumb: one tap starts the timer, nothing asked first.
 * It sits on a fade to the page, so the content scrolling under it never fights its label; while
 * it is mounted, `pb-page` keeps the end of the content clear of that fade.
 */
export function CravingLauncher({ journal, now }: CravingLauncherProps) {
  const navigate = useNavigate()
  if (latestQuitMoment(journal) === null) return null

  const start = () =>
    void navigate({
      to: '/craving/timer',
      search: (prev) => ({ ...validateAppSearch(prev), startedAt: now }),
    })

  return (
    <div
      data-craving-launcher
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-linear-to-b from-transparent to-55% to-page/92 pt-10"
    >
      <div className="mx-auto flex max-w-md justify-end px-4 pb-safe-4">
        <CravingButton
          label={strings.craving.launch}
          onClick={start}
          className="pointer-events-auto"
        />
      </div>
    </div>
  )
}
