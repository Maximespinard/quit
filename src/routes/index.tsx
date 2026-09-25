import { createFileRoute, Link, useLocation } from '@tanstack/react-router'
import { CravingLauncher } from '@/features/craving/components/CravingLauncher'
import { SandboxEntry } from '@/features/debug/components/SandboxEntry'
import { DayPatchCard } from '@/features/patch/components/DayPatchCard'
import { ProtocolSummary } from '@/features/protocol/components/ProtocolSummary'
import { protocolContext } from '@/features/protocol/utils/protocol-context'
import { QuitMomentPrompt } from '@/features/quit-moment/components/QuitMomentPrompt'
import { StreakScreen } from '@/features/streak/components/StreakScreen'
import { derive } from '@/shared/domain/derive'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
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
  const { cravingRecorded, patchRecorded } = useLocation({ select: (location) => location.state })
  const brand = <SandboxEntry>{strings.app.name}</SandboxEntry>

  return (
    <ReadyJournal state={state} brand={brand}>
      {(journal) => {
        const derived = derive(journal, now)
        if (derived.streak === null) {
          return (
            <AppShell brand={brand}>
              <QuitMomentPrompt journal={journal} now={now} onRecorded={commit} />
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
            >
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
              <Link
                to="/craving/past"
                search={appSearch}
                className={buttonVariants({ variant: 'outline' })}
              >
                {strings.craving.logPast}
              </Link>
            </div>
            <CravingLauncher now={now} />
          </div>
        )
      }}
    </ReadyJournal>
  )
}
