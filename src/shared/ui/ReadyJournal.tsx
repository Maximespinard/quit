import type { ReactNode } from 'react'
import type { Journal } from '@/shared/domain/journal'
import type { JournalState } from '@/shared/hooks/useJournal'
import { strings } from '@/shared/utils/strings'
import { AppShell } from './app-shell'

type ReadyJournalProps = {
  state: JournalState
  /** The brand mark shown while loading or on error; defaults to the app name. */
  brand?: ReactNode
  /**
   * The page's header, kept through loading and error. With it, the ready content renders in
   * the same shell, under it; without, the content brings its own shell.
   */
  header?: ReactNode
  /** Rendered only once the journal is readable. */
  children: (journal: Journal) => ReactNode
}

/** The journal's loading and error states, in one place for every screen that reads it. */
export function ReadyJournal({ state, brand, header, children }: ReadyJournalProps) {
  if (state.status === 'loading') {
    return (
      <AppShell brand={brand}>
        {header}
        <p className="text-body text-muted">{strings.journal.loading}</p>
      </AppShell>
    )
  }
  if (state.status === 'error') {
    return (
      <AppShell brand={brand}>
        {header}
        <p role="alert" className="text-alert text-body">
          {strings.journal.error}
        </p>
      </AppShell>
    )
  }
  if (header === undefined) return children(state.journal)
  return (
    <AppShell brand={brand}>
      {header}
      {children(state.journal)}
    </AppShell>
  )
}
