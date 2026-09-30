import { createFileRoute } from '@tanstack/react-router'
import { ProtocolEditor } from '@/features/protocol/components/ProtocolEditor'
import { derive } from '@/shared/domain/derive'
import { useCommitThenHome } from '@/shared/hooks/useCommitThenHome'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { BackLink, PageHeader } from '@/shared/ui/PageHeader'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { keepSearch, validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/protocol')({
  component: ProtocolPage,
})

function ProtocolPage() {
  const appSearch = validateAppSearch(Route.useSearch())
  const { state, now } = useJournalSource()
  const saved = useCommitThenHome(appSearch)
  const copy = strings.protocol

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
      {(journal) => (
        <ProtocolEditor
          journal={journal}
          position={derive(journal, now).protocol}
          onSaved={saved}
        />
      )}
    </ReadyJournal>
  )
}
