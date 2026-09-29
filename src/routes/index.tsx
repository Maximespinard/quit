import { createFileRoute, Link, useLocation } from '@tanstack/react-router'
import { Settings } from 'lucide-react'
import { BackupReminder } from '@/features/backup/components/BackupReminder'
import { ImportJournal } from '@/features/backup/components/ImportJournal'
import { CravingLauncher } from '@/features/craving/components/CravingLauncher'
import { SandboxEntry } from '@/features/debug/components/SandboxEntry'
import { SlipNote } from '@/features/lapse/components/SlipNote'
import { DayPatchCard } from '@/features/patch/components/DayPatchCard'
import { ProtocolSummary } from '@/features/protocol/components/ProtocolSummary'
import { protocolContext } from '@/features/protocol/utils/protocol-context'
import { GoalSummary } from '@/features/savings/components/GoalSummary'
import { SavingsTotals } from '@/features/savings/components/SavingsTotals'
import { FirstLaunch } from '@/features/setup/components/FirstLaunch'
import { StreakScreen } from '@/features/streak/components/StreakScreen'
import { StreakTotals } from '@/features/streak/components/StreakTotals'
import { derive } from '@/shared/domain/derive'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { useRecordedThenHome } from '@/shared/hooks/useRecordedThenHome'
import { AppShell } from '@/shared/ui/app-shell'
import { buttonVariants } from '@/shared/ui/base/button'
import { Card } from '@/shared/ui/Card'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { RowLink } from '@/shared/ui/RowLink'
import { validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { state, commit, now } = useJournalSource()
  const appSearch = validateAppSearch(Route.useSearch())
  const imported = useRecordedThenHome(appSearch, 'journalImported')
  const { cravingRecorded, patchRecorded, lapseRecorded, journalImported } = useLocation({
    select: (location) => location.state,
  })
  const brand = <SandboxEntry>{strings.app.name}</SandboxEntry>

  return (
    <ReadyJournal state={state} brand={brand}>
      {(journal) => {
        const derived = derive(journal, now)
        if (derived.streak === null) {
          return (
            <AppShell brand={brand} haze="hero">
              <FirstLaunch
                journal={journal}
                now={now}
                onStarted={commit}
                restore={
                  <ImportJournal
                    journal={journal}
                    label={strings.backup.restore}
                    variant="ghost"
                    onImported={imported}
                  />
                }
              />
            </AppShell>
          )
        }
        return (
          // The Fixed Pill Rule: the bottom clearance keeps content out from under `Envie`.
          <div className="pb-32">
            <StreakScreen
              streak={derived.streak}
              brand={brand}
              context={protocolContext(derived.protocol)}
              action={
                <Link
                  to="/settings"
                  search={appSearch}
                  aria-label={strings.nav.settings}
                  className="grid size-11 place-items-center rounded-full text-ink active:bg-ghost"
                >
                  <Settings className="size-5" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              }
            >
              <StreakTotals
                smokeFreeDays={derived.smokeFreeDays}
                personalBest={derived.personalBest}
              />
              {/* The slip note reads as the totals' footnote, aligned with the card's text. */}
              <SlipNote
                lastCigarette={derived.lastCigarette}
                lapseDaysInARow={derived.lapseDaysInARow}
              />
              <SavingsTotals
                moneySavedCents={derived.moneySavedCents}
                cigarettesNotSmoked={derived.cigarettesNotSmoked}
              />
              {/* Under the totals, never above: the acquired figures keep their place under the hero. */}
              <BackupReminder journal={journal} quitMoment={derived.quitMoment} />
              {derived.patch.status === 'over' ? null : (
                <DayPatchCard
                  journal={journal}
                  patch={derived.patch}
                  suggestedSite={derived.suggestedSite}
                  previousSite={derived.previousSite}
                  now={now}
                  recorded={patchRecorded === true}
                  onRecorded={commit}
                />
              )}
              {/* Without money saved there is nothing to measure a goal against. */}
              {derived.moneySavedCents === null ? null : (
                <GoalSummary journal={journal} goal={derived.goal} onCelebrated={commit} />
              )}
              <ProtocolSummary position={derived.protocol} />
              {cravingRecorded === true ? (
                <p role="status" className="px-2 text-body text-muted">
                  {strings.craving.recorded}
                </p>
              ) : null}
              {journalImported === true ? (
                <p role="status" className="px-2 text-body text-muted">
                  {strings.backup.imported}
                </p>
              ) : null}
              {lapseRecorded === true ? (
                <p role="status" className="px-2 text-body text-muted">
                  {strings.lapse.recorded}
                </p>
              ) : null}
              <Link
                to="/craving/past"
                search={appSearch}
                className={buttonVariants({ variant: 'secondary', size: 'lg' })}
              >
                {strings.craving.logPast}
              </Link>
              <Card padding="rows" className="py-1">
                <RowLink to="/lapse" search={appSearch}>
                  {strings.lapse.declare}
                </RowLink>
                <RowLink to="/stats" search={appSearch}>
                  {strings.stats.open}
                </RowLink>
                <RowLink to="/calendar" search={appSearch}>
                  {strings.calendar.open}
                </RowLink>
                <RowLink to="/history" search={appSearch}>
                  {strings.history.open}
                </RowLink>
              </Card>
            </StreakScreen>
            <CravingLauncher now={now} />
          </div>
        )
      }}
    </ReadyJournal>
  )
}
