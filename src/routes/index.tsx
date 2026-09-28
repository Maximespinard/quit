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
import { FirstLaunch } from '@/features/setup/components/FirstLaunch'
import { StreakScreen } from '@/features/streak/components/StreakScreen'
import { StreakTotals } from '@/features/streak/components/StreakTotals'
import { derive } from '@/shared/domain/derive'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { useRecordedThenHome } from '@/shared/hooks/useRecordedThenHome'
import { AppShell } from '@/shared/ui/app-shell'
import { buttonVariants } from '@/shared/ui/base/button'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
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
            <AppShell brand={brand}>
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
          <div className="pb-28">
            <StreakScreen
              streak={derived.streak}
              brand={brand}
              context={protocolContext(derived.protocol)}
              action={
                <Link
                  to="/settings"
                  search={appSearch}
                  aria-label={strings.nav.settings}
                  className="grid size-11 place-items-center rounded-control text-on-ink active:bg-on-ink/15"
                >
                  <Settings className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </Link>
              }
            >
              {/* The slip note reads as the totals' footnote: grouped tight under the card. */}
              <div className="flex flex-col gap-3">
                <StreakTotals
                  smokeFreeDays={derived.smokeFreeDays}
                  personalBest={derived.personalBest}
                />
                <SlipNote
                  lastCigarette={derived.lastCigarette}
                  lapseDaysInARow={derived.lapseDaysInARow}
                />
              </div>
              {/* Under the totals, never above: the acquired figures keep their place under the hero. */}
              <BackupReminder journal={journal} quitMoment={derived.quitMoment} />
              {derived.patch.status === 'over' ? null : (
                <DayPatchCard
                  journal={journal}
                  patch={derived.patch}
                  now={now}
                  recorded={patchRecorded === true}
                  onRecorded={commit}
                />
              )}
              <ProtocolSummary position={derived.protocol} />
            </StreakScreen>
            <div className="mx-auto flex max-w-md flex-col items-start gap-3 px-safe pt-5">
              {cravingRecorded === true ? (
                <p role="status" className="text-body text-ink-soft">
                  {strings.craving.recorded}
                </p>
              ) : null}
              {journalImported === true ? (
                <p role="status" className="text-body text-ink-soft">
                  {strings.backup.imported}
                </p>
              ) : null}
              {lapseRecorded === true ? (
                <p role="status" className="text-body text-ink-soft">
                  {strings.lapse.recorded}
                </p>
              ) : null}
              <Link
                to="/craving/past"
                search={appSearch}
                className={buttonVariants({ variant: 'outline' })}
              >
                {strings.craving.logPast}
              </Link>
              <Link to="/lapse" search={appSearch} className={buttonVariants({ variant: 'ghost' })}>
                {strings.lapse.declare}
              </Link>
              <Link
                to="/history"
                search={appSearch}
                className={buttonVariants({ variant: 'ghost' })}
              >
                {strings.history.open}
              </Link>
            </div>
            <CravingLauncher now={now} />
          </div>
        )
      }}
    </ReadyJournal>
  )
}
