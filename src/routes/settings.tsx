import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router'
import { BackupSection } from '@/features/backup/components/BackupSection'
import { CravingLauncher } from '@/features/craving/components/CravingLauncher'
import { DeviceKeySection } from '@/features/mirror/components/DeviceKeySection'
import { SettingsScreen } from '@/features/setup/components/SettingsScreen'
import { latestQuitMoment } from '@/shared/domain/facts/quit-moment'
import type { Journal } from '@/shared/domain/journal'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { useRecordedThenHome } from '@/shared/hooks/useRecordedThenHome'
import { AppShell } from '@/shared/ui/app-shell'
import { BackLink, PageHeader } from '@/shared/ui/PageHeader'
import { keepSearch, validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const appSearch = validateAppSearch(Route.useSearch())
  const { state, commit, now, mirror } = useJournalSource()
  const navigate = useNavigate()
  const imported = useRecordedThenHome(appSearch, 'journalImported')
  // Home is the acknowledgement: it already shows what the new values change.
  const saved = (journal: Journal) =>
    void commit(journal).then(() => navigate({ to: '/', search: appSearch, replace: true }))
  const copy = strings.settings

  return (
    <AppShell>
      <PageHeader
        title={copy.title}
        back={<BackLink to="/" search={keepSearch} aria-label={copy.back} />}
      />

      {state.status === 'loading' ? (
        <p className="text-body text-muted">{strings.journal.loading}</p>
      ) : state.status === 'error' ? (
        <p role="alert" className="text-alert text-body">
          {strings.journal.error}
        </p>
      ) : latestQuitMoment(state.journal) === null ? (
        // No "not yet quit" state: before first launch, settings would start a journey half-set.
        <Navigate to="/" search={keepSearch} replace />
      ) : (
        <>
          <SettingsScreen journal={state.journal} now={now} onSaved={saved} />
          {mirror === null ? null : <DeviceKeySection mirror={mirror} />}
          <BackupSection journal={state.journal} onImported={imported} />
          <CravingLauncher journal={state.journal} now={now} />
        </>
      )}
    </AppShell>
  )
}
