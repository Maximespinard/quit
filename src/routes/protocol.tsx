import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ProtocolEditor } from '@/features/protocol/components/ProtocolEditor'
import { derive } from '@/shared/domain/derive'
import type { Journal } from '@/shared/domain/journal'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/app-shell'
import { BackLink, PageHeader } from '@/shared/ui/PageHeader'
import { keepSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/protocol')({
  component: ProtocolPage,
})

function ProtocolPage() {
  const { state, commit, now } = useJournalSource()
  const navigate = useNavigate()
  const copy = strings.protocol

  const save = async (journal: Journal) => {
    await commit(journal)
    await navigate({ to: '/', search: keepSearch })
  }

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
      ) : (
        <ProtocolEditor
          journal={state.journal}
          position={derive(state.journal, now).protocol}
          onSaved={save}
        />
      )}
    </AppShell>
  )
}
