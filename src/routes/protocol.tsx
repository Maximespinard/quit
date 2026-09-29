import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { ProtocolEditor } from '@/features/protocol/components/ProtocolEditor'
import { derive } from '@/shared/domain/derive'
import type { Journal } from '@/shared/domain/journal'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/app-shell'
import { buttonVariants } from '@/shared/ui/base/button'
import { keepSearch } from '@/shared/utils/app-search'
import { cn } from '@/shared/utils/cn'
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
