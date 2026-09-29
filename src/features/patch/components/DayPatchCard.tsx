import type { ApplicationSite } from '@quit/contract/facts'
import { Link } from '@tanstack/react-router'
import { useId, useState } from 'react'
import {
  type RecordPatchApplicationResult,
  recordPatchApplication,
} from '@/shared/domain/facts/patch-application'
import type { Journal } from '@/shared/domain/journal'
import type { ProtocolDayPatch } from '@/shared/domain/protocol-day-patch'
import { Button, buttonVariants } from '@/shared/ui/base/button'
import { keepSearch } from '@/shared/utils/app-search'
import { cn } from '@/shared/utils/cn'
import { formatDose, formatTime } from '@/shared/utils/format'
import { isSameLocalDay } from '@/shared/utils/local-day'
import { strings } from '@/shared/utils/strings'
import { applicationAt, chosenSite, type SiteChoice, untouched } from '../utils/site-choice'
import { SitePicker } from './SitePicker'

const copy = strings.patch

type Refusal = Extract<RecordPatchApplicationResult, { ok: false }>['reason']

type DayPatchCardProps = {
  journal: Journal
  /** Only the states that ask for a patch: the app layer shows nothing once the protocol is over. */
  patch: Exclude<ProtocolDayPatch, { status: 'over' }>
  /** Pressed until the user picks another site or none: the one tap logs it. */
  suggestedSite: ApplicationSite
  /** The latest patch application's site: greyed, never pressable. */
  previousSite: ApplicationSite | null
  /** Injected clock: a one-tap log records at this instant. */
  now: number
  /** Set on arrival from the form: the header confirms it, even for another protocol day. */
  recorded: boolean
  onRecorded: (journal: Journal) => void
}

/** Home screen block: whether the protocol day's patch is on, and the one tap that logs it. */
export function DayPatchCard({
  journal,
  patch,
  suggestedSite,
  previousSite,
  now,
  recorded,
  onRecorded,
}: DayPatchCardProps) {
  const titleId = useId()
  // Reachable in the sandbox only: a clock moved before the quit moment refuses the tap.
  const [refusal, setRefusal] = useState<Refusal | null>(null)
  // Untouched, the site follows the suggestion, which moves on once a patch is logged.
  const [choice, setChoice] = useState<SiteChoice>(untouched)
  const site = chosenSite(choice, suggestedSite, previousSite)

  const applyNow = (doseMg: number) => {
    const result = recordPatchApplication(journal, applicationAt(now, doseMg, site), now)
    if (result.ok) {
      setChoice(untouched)
      onRecorded(result.journal)
    } else setRefusal(result.reason)
  }

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between text-label">
        <h2 id={titleId} className="font-medium text-body text-ink">
          {copy.title}
        </h2>
        {recorded ? (
          <p role="status" className="text-muted">
            {copy.recorded}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 rounded-card bg-surface p-4">
        {patch.status === 'logged' ? (
          // The protocol card's shape: the figure that changes, then its detail.
          <p className="flex flex-col gap-1">
            <span className="text-figure tabular-nums">{copy.logged(formatTime(patch.at))}</span>
            <span className="text-muted text-label">
              {copy.loggedDetail(
                isSameLocalDay(patch.at, now),
                formatDose(patch.doseMg),
                patch.site === undefined ? null : copy.sites[patch.site],
              )}
            </span>
          </p>
        ) : (
          <>
            <p className="font-medium text-body">{copy.due}</p>
            <SitePicker
              value={site}
              previous={previousSite}
              onValueChange={(next) => setChoice({ kind: 'picked', site: next })}
            />
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
          // Text aligned with the card's edge and its bottom inset, the 44px target kept.
          className={cn(buttonVariants({ variant: 'ghost' }), '-mb-3 -ml-4 self-start')}
        >
          {copy.other}
        </Link>
      </div>
    </section>
  )
}
