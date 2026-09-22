import { createFileRoute } from '@tanstack/react-router'
import { QuitMomentPrompt } from '@/features/quit-moment/components/QuitMomentPrompt'
import { StreakScreen } from '@/features/streak/components/StreakScreen'
import { derive } from '@/shared/domain/derive'
import { useJournal } from '@/shared/hooks/useJournal'
import { useNow } from '@/shared/hooks/useNow'
import { AppShell } from '@/shared/ui/app-shell'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const now = useNow()
  const { state, commit } = useJournal()

  if (state.status === 'loading') {
    return (
      <AppShell>
        <p className="text-body text-ink-soft">{strings.journal.loading}</p>
      </AppShell>
    )
  }
  if (state.status === 'error') {
    return (
      <AppShell>
        <p role="alert" className="text-alert text-body">
          {strings.journal.error}
        </p>
      </AppShell>
    )
  }

  const derived = derive(state.journal, now)
  if (derived.streak === null) {
    return (
      <AppShell>
        <QuitMomentPrompt journal={state.journal} now={now} onRecorded={commit} />
      </AppShell>
    )
  }
  return <StreakScreen quitMoment={derived.quitMoment} streak={derived.streak} />
}
