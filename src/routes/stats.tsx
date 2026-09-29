import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { CravingStatsView } from '@/features/stats/components/CravingStatsView'
import { derive } from '@/shared/domain/derive'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/app-shell'
import { buttonVariants } from '@/shared/ui/base/button'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { validateAppSearch } from '@/shared/utils/app-search'
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
            <div className="flex flex-col gap-2 pt-6">
              <h2 className="text-title">{copy.title}</h2>
              <p className="text-body text-ink-soft">{copy.lead}</p>
            </div>
            <CravingStatsView stats={cravingStats} />
            <Link
              to="/"
              search={appSearch}
              className={buttonVariants({ variant: 'ghost', size: 'lg' })}
            >
              {copy.back}
            </Link>
          </AppShell>
        )
      }}
    </ReadyJournal>
  )
}
