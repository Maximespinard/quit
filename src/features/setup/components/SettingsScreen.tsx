import type { Journal } from '@/shared/domain/journal'
import { Card } from '@/shared/ui/Card'
import { RowLink } from '@/shared/ui/RowLink'
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
      <Card padding="rows" className="py-1">
        <RowLink to="/protocol" search={keepSearch} className="py-3">
          <span className="flex flex-col gap-1">
            <span>{copy.protocol.open}</span>
            <span className="text-muted text-label">
              {copy.protocol.doses(journal.protocol.map((step) => formatDose(step.doseMg)))}
            </span>
          </span>
        </RowLink>
      </Card>
    </div>
  )
}
