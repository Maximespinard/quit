import { createFileRoute } from '@tanstack/react-router'
import { SandboxEntry } from '@/features/debug/components/SandboxEntry'
import { ProtocolSummary } from '@/features/protocol/components/ProtocolSummary'
import { protocolContext } from '@/features/protocol/utils/protocol-context'
import { QuitMomentPrompt } from '@/features/quit-moment/components/QuitMomentPrompt'
import { StreakScreen } from '@/features/streak/components/StreakScreen'
import { derive } from '@/shared/domain/derive'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/app-shell'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { state, commit, now } = useJournalSource()
  const brand = <SandboxEntry>{strings.app.name}</SandboxEntry>

  if (state.status === 'loading') {
    return (
      <AppShell brand={brand}>
        <p className="text-body text-ink-soft">{strings.journal.loading}</p>
      </AppShell>
    )
  }
  if (state.status === 'error') {
    return (
      <AppShell brand={brand}>
        <p role="alert" className="text-alert text-body">
          {strings.journal.error}
        </p>
      </AppShell>
    )
  }

  const derived = derive(state.journal, now)
  if (derived.streak === null) {
    return (
      <AppShell brand={brand}>
        <QuitMomentPrompt journal={state.journal} now={now} onRecorded={commit} />
      </AppShell>
    )
  }
  return (
    <StreakScreen streak={derived.streak} brand={brand} context={protocolContext(derived.protocol)}>
      <ProtocolSummary position={derived.protocol} />
    </StreakScreen>
  )
}
