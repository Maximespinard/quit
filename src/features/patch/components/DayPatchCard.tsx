import type { ApplicationSite } from '@quit/contract/facts'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  type RecordPatchApplicationResult,
  recordPatchApplication,
} from '@/shared/domain/facts/patch-application'
import type { Journal } from '@/shared/domain/journal'
import type { TodayPatch } from '@/shared/domain/today-patch'
import { Button, buttonVariants } from '@/shared/ui/base/button'
import { Card } from '@/shared/ui/Card'
import { keepSearch } from '@/shared/utils/app-search'
import { cn } from '@/shared/utils/cn'
import { newFactId } from '@/shared/utils/fact-id'
import { formatDose, formatTime } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import { applicationAt, chosenSite, type SiteChoice, untouched } from '../utils/site-choice'
import { SitePicker } from './SitePicker'

const copy = strings.patch

type Refusal = Extract<RecordPatchApplicationResult, { ok: false }>['reason']

type DayPatchCardProps = {
  journal: Journal
  /** The app layer shows nothing once the protocol is over. */
  patch: Exclude<TodayPatch, { status: 'over' }>
  /** Pressed until the user picks another site or none: the one tap logs it. */
  suggestedSite: ApplicationSite
  /** The latest patch application's site: greyed, never pressable. */
  previousSite: ApplicationSite | null
  /** Injected clock: a one-tap log records at this instant. */
  now: number
  onRecorded: (journal: Journal) => void
}

/**
 * Home screen block: whether today's patch is on, and the one tap that logs it. The quit day
 * offers it the same way a due day asks for it.
 */
export function DayPatchCard({
  journal,
  patch,
  suggestedSite,
  previousSite,
  now,
  onRecorded,
}: DayPatchCardProps) {
  // Reachable in the sandbox only: a clock moved before the quit moment refuses the tap.
  const [refusal, setRefusal] = useState<Refusal | null>(null)
  // Untouched, the site follows the suggestion, which moves on once a patch is logged.
  const [choice, setChoice] = useState<SiteChoice>(untouched)
  const site = chosenSite(choice, suggestedSite, previousSite)

  const applyNow = (doseMg: number) => {
    const result = recordPatchApplication(
      journal,
      { id: newFactId(), ...applicationAt(now, doseMg, site) },
      now,
    )
    if (result.ok) {
      setChoice(untouched)
      onRecorded(result.journal)
    } else setRefusal(result.reason)
  }

  return (
    <Card title={copy.title}>
      {patch.status === 'logged' ? (
        // The figure that changes, then its detail.
        <p className="flex flex-col gap-1">
          <span className="text-figure tabular-nums">{copy.logged(formatTime(patch.at))}</span>
          <span className="text-body text-muted">
            {copy.loggedDetail(
              formatDose(patch.doseMg),
              patch.site === undefined ? null : copy.sites[patch.site],
            )}
          </span>
        </p>
      ) : (
        <>
          <p className="text-title">{copy.due}</p>
          <SitePicker
            value={site}
            suggested={suggestedSite}
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
        className={cn(buttonVariants({ variant: 'link' }), 'self-start')}
      >
        {copy.other}
      </Link>
    </Card>
  )
}
