import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { BackupSection } from '@/features/backup/components/BackupSection'
import { SettingsScreen } from '@/features/setup/components/SettingsScreen'
import { latestQuitMoment } from '@/shared/domain/facts/quit-moment'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { useRecordedThenHome } from '@/shared/hooks/useRecordedThenHome'
import { AppShell } from '@/shared/ui/app-shell'
import { buttonVariants } from '@/shared/ui/base/button'
import { keepSearch, validateAppSearch } from '@/shared/utils/app-search'
import { cn } from '@/shared/utils/cn'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { state, commit, now } = useJournalSource()
  const imported = useRecordedThenHome(validateAppSearch(Route.useSearch()), 'journalImported')
  const copy = strings.settings

  return (
    <AppShell>
      <div className="flex items-center gap-2">
        <Link
          to="/"
          search={keepSearch}
          aria-label={copy.back}
          // Pulled into the gutter so the chevron, not its touch target, lines up with the text.
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), '-ml-3')}
        >
          <ChevronLeft strokeWidth={1.75} aria-hidden="true" />
        </Link>
        <h2 className="text-title">{copy.title}</h2>
      </div>

      {state.status === 'loading' ? (
        <p className="text-body text-ink-soft">{strings.journal.loading}</p>
      ) : state.status === 'error' ? (
        <p role="alert" className="text-alert text-body">
          {strings.journal.error}
        </p>
      ) : latestQuitMoment(state.journal) === null ? (
        // No "not yet quit" state: before first launch, settings would start a journey half-set.
        <Navigate to="/" search={keepSearch} replace />
      ) : (
        <>
          <SettingsScreen journal={state.journal} now={now} onSaved={commit} />
          <BackupSection journal={state.journal} onImported={imported} />
        </>
      )}
    </AppShell>
  )
}
