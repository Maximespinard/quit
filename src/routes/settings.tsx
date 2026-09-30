import { createFileRoute, Navigate } from '@tanstack/react-router'
import { BackupSection } from '@/features/backup/components/BackupSection'
import { CravingLauncher } from '@/features/craving/components/CravingLauncher'
import { DeviceKeySection } from '@/features/mirror/components/DeviceKeySection'
import { SettingsScreen } from '@/features/setup/components/SettingsScreen'
import { latestQuitMoment } from '@/shared/domain/facts/quit-moment'
import { useCommitThenHome } from '@/shared/hooks/useCommitThenHome'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { BackLink, PageHeader } from '@/shared/ui/PageHeader'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { keepSearch, validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const appSearch = validateAppSearch(Route.useSearch())
  const { state, now, mirror } = useJournalSource()
  const imported = useCommitThenHome(appSearch, 'journalImported')
  // Home is the acknowledgement: it already shows what the new values change.
  const saved = useCommitThenHome(appSearch)
  const copy = strings.settings

  return (
    <ReadyJournal
      state={state}
      header={
        <PageHeader
          title={copy.title}
          back={<BackLink to="/" search={keepSearch} aria-label={copy.back} />}
        />
      }
    >
      {(journal) =>
        latestQuitMoment(journal) === null ? (
          // No "not yet quit" state: before first launch, settings would start a journey half-set.
          <Navigate to="/" search={keepSearch} replace />
        ) : (
          <>
            <SettingsScreen journal={journal} now={now} onSaved={saved} />
            {mirror === null ? null : <DeviceKeySection mirror={mirror} />}
            <BackupSection journal={journal} onImported={imported} />
            <CravingLauncher journal={journal} now={now} />
          </>
        )
      }
    </ReadyJournal>
  )
}
