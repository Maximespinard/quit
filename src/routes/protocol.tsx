import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { ProtocolEditor } from '@/features/protocol/components/ProtocolEditor'
import type { Journal } from '@/shared/domain/journal'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/app-shell'
import { buttonVariants } from '@/shared/ui/base/button'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/protocol')({
  component: ProtocolPage,
})

function ProtocolPage() {
  const { state, commit } = useJournalSource()
  const navigate = useNavigate()
  const copy = strings.protocol

  const save = async (journal: Journal) => {
    await commit(journal)
    // The search carries the sandbox: leaving it out would land on the real journal.
    await navigate({ to: '/', search: (previous) => previous })
  }

  return (
    <AppShell>
      <div className="flex items-center gap-2">
        <Link
          to="/"
          search={(previous) => previous}
          aria-label={copy.back}
          className={buttonVariants({ variant: 'ghost', size: 'icon' })}
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
      ) : (
        <ProtocolEditor journal={state.journal} onSaved={save} />
      )}
    </AppShell>
  )
}
