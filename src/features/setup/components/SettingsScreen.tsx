import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import type { Journal } from '@/shared/domain/journal'
import { setBaselineSmokesPerDay, setWeeklySpend } from '@/shared/domain/journal-settings'
import { keepSearch } from '@/shared/utils/app-search'
import { formatDose } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import { baselineInput, spendInput } from '../utils/value-inputs'
import { QuitMomentSetting } from './QuitMomentSetting'
import { ValueSetting } from './ValueSetting'

type SettingsScreenProps = {
  journal: Journal
  /** Injected clock: the screen never reads the system time itself. */
  now: number
  onSaved: (journal: Journal) => void
}

const copy = strings.settings

const okOrNull = (result: { ok: true; journal: Journal } | { ok: false }) =>
  result.ok ? result.journal : null

/** Everything first launch asked, editable again; each setting saves on its own. */
export function SettingsScreen({ journal, now, onSaved }: SettingsScreenProps) {
  return (
    <div className="flex flex-col gap-5">
      <QuitMomentSetting journal={journal} now={now} onSaved={onSaved} />
      <ValueSetting
        label={copy.spend.label}
        input={spendInput}
        value={journal.weeklySpendCents}
        apply={(cents) => okOrNull(setWeeklySpend(journal, cents))}
        onSaved={onSaved}
      />
      <ValueSetting
        label={copy.baseline.label}
        input={baselineInput}
        value={journal.baselineSmokesPerDay}
        apply={(perDay) => okOrNull(setBaselineSmokesPerDay(journal, perDay))}
        onSaved={onSaved}
      />
      <Link
        to="/protocol"
        search={keepSearch}
        className="flex min-h-12 items-center justify-between gap-3 rounded-card bg-surface p-4 active:bg-surface-locked"
      >
        <span className="flex flex-col gap-1">
          <span className="font-semibold text-body">{copy.protocol.open}</span>
          <span className="text-ink-dim text-label">
            {journal.protocol.map((step) => `${formatDose(step.doseMg)} mg`).join(' → ')}
          </span>
        </span>
        <ChevronRight className="size-5 text-ink-soft" strokeWidth={1.75} aria-hidden="true" />
      </Link>
    </div>
  )
}
