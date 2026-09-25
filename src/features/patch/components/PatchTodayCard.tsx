import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { useId, useState } from 'react'
import {
  type RecordPatchApplicationResult,
  recordPatchApplication,
} from '@/shared/domain/facts/patch-application'
import type { Journal } from '@/shared/domain/journal'
import type { PatchToday } from '@/shared/domain/patch-today'
import { Button, buttonVariants } from '@/shared/ui/base/button'
import { keepSearch } from '@/shared/utils/app-search'
import { cn } from '@/shared/utils/cn'
import { formatDose, formatTime } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'

const copy = strings.patch

type Refusal = Extract<RecordPatchApplicationResult, { ok: false }>['reason']

type PatchTodayCardProps = {
  journal: Journal
  /** Only the states that ask for a patch: the app layer shows nothing once the protocol is over. */
  patch: Exclude<PatchToday, { status: 'over' }>
  /** Injected clock: a one-tap log records at this instant. */
  now: number
  onRecorded: (journal: Journal) => void
}

/** Home screen block: whether today's patch is on, and the one tap that logs it. */
export function PatchTodayCard({ journal, patch, now, onRecorded }: PatchTodayCardProps) {
  const titleId = useId()
  // Reachable in the sandbox only: a clock moved before the quit moment refuses the tap.
  const [refusal, setRefusal] = useState<Refusal | null>(null)

  const applyNow = (doseMg: number) => {
    const result = recordPatchApplication(journal, { at: now, doseMg }, now)
    if (result.ok) onRecorded(result.journal)
    else setRefusal(result.reason)
  }

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-2.5">
      <h2 id={titleId} className="font-semibold text-body text-ink">
        {copy.title}
      </h2>

      <div className="flex flex-col gap-3 rounded-card bg-surface p-4">
        {patch.status === 'logged' ? (
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-action text-page">
              <Check className="size-5" strokeWidth={2} aria-hidden="true" />
            </span>
            <p className="flex flex-col">
              <span className="font-semibold text-body">{copy.logged}</span>
              <span className="text-ink-dim text-label tabular-nums">
                {copy.loggedDetail(formatTime(patch.at), formatDose(patch.doseMg))}
              </span>
            </p>
          </div>
        ) : (
          <>
            <p className="text-body text-ink-soft">{copy.due}</p>
            <Button size="lg" onClick={() => applyNow(patch.doseMg)}>
              {copy.apply(formatDose(patch.doseMg))}
            </Button>
            {refusal !== null ? (
              <p role="alert" className="text-alert text-label">
                {copy.form[refusal]}
              </p>
            ) : null}
          </>
        )}
        <Link
          to="/patch/new"
          search={keepSearch}
          // Text aligned with the card's; on the surface the ghost's own press fill would not show.
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            '-ml-4 self-start active:bg-surface-locked',
          )}
        >
          {copy.other}
        </Link>
      </div>
    </section>
  )
}
