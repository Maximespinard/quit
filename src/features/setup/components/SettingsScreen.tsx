import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import type { Journal } from '@/shared/domain/journal'
import { keepSearch } from '@/shared/utils/app-search'
import { formatDose } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import { SettingsForm } from './SettingsForm'

type SettingsScreenProps = {
  journal: Journal
  /** Injected clock: the screen never reads the system time itself. */
  now: number
  onSaved: (journal: Journal) => void
}

const copy = strings.settings

/** The settings form, then the way to the protocol editor, which has its own save. */
export function SettingsScreen({ journal, now, onSaved }: SettingsScreenProps) {
  return (
    <div className="flex flex-col gap-8">
      <SettingsForm journal={journal} now={now} onSaved={onSaved} />
      <Link
        to="/protocol"
        search={keepSearch}
        className="flex min-h-12 items-center justify-between gap-3 rounded-card bg-surface p-4 active:bg-surface-locked"
      >
        <span className="flex flex-col gap-1">
          <span className="font-semibold text-body">{copy.protocol.open}</span>
          <span className="text-ink-dim text-label">
            {copy.protocol.doses(journal.protocol.map((step) => formatDose(step.doseMg)))}
          </span>
        </span>
        <ChevronRight className="size-5 text-ink-soft" strokeWidth={1.75} aria-hidden="true" />
      </Link>
    </div>
  )
}
