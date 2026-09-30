import { createFileRoute, Navigate } from '@tanstack/react-router'
import { CravingLauncher } from '@/features/craving/components/CravingLauncher'
import { CravingStatsView } from '@/features/stats/components/CravingStatsView'
import { derive } from '@/shared/domain/derive'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/AppShell'
import { BackLink, PageHeader } from '@/shared/ui/PageHeader'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { keepSearch, validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/stats')({
  component: StatsPage,
})

const copy = strings.stats

function StatsPage() {
  const appSearch = validateAppSearch(Route.useSearch())
  const { state, now } = useJournalSource()

  return (
    <ReadyJournal state={state}>
      {(journal) => {
        const { cravingStats } = derive(journal, now)
        // No quit moment yet: first launch, on the home screen, comes first.
        if (cravingStats === null) return <Navigate to="/" search={appSearch} replace />
        return (
          <AppShell>
            <PageHeader
              title={copy.title}
              lead={copy.lead}
              back={<BackLink to="/" search={keepSearch} aria-label={copy.back} />}
            />
            <CravingStatsView stats={cravingStats} />
            <CravingLauncher journal={journal} now={now} />
          </AppShell>
        )
      }}
    </ReadyJournal>
  )
}
