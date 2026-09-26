import { derive } from '@/shared/domain/derive'
import { recordCraving } from '@/shared/domain/facts/craving'
import { recordLapse } from '@/shared/domain/facts/lapse'
import type { Journal } from '@/shared/domain/journal'
import type { SandboxControls } from '@/shared/hooks/useJournalSource'
import { Button } from '@/shared/ui/base/button'
import { strings } from '@/shared/utils/strings'

const copy = strings.debug

type SandboxActionsProps = {
  journal: Journal
  now: number
  commit: (journal: Journal) => Promise<void>
  sandbox: SandboxControls
}

/**
 * Facts injected at the sandbox's current time, and the clock jumped to the next step change.
 * Each one goes through the same record function the screens use: a refused fact (no quit
 * moment yet) is simply not offered.
 */
export function SandboxActions({ journal, now, commit, sandbox }: SandboxActionsProps) {
  const derived = derive(journal, now)
  const position = derived.protocol
  const canInject = derived.quitMoment !== null

  const injectCraving = () => {
    const result = recordCraving(journal, { at: now, intensity: 2, heldToEnd: true, tags: [] }, now)
    if (result.ok) void commit(result.journal)
  }
  const injectLapse = () => {
    const result = recordLapse(journal, { at: now, count: 1 }, now)
    if (result.ok) void commit(result.journal)
  }

  return (
    <>
      <Button
        variant="secondary"
        disabled={position === null || position.status === 'over'}
        onClick={() => {
          if (position?.status === 'running') sandbox.stopClockAt(position.endsAt)
        }}
      >
        {position?.status === 'running' && position.nextStep === null
          ? copy.jumpToEnd
          : copy.jumpToNextStep}
      </Button>
      <fieldset>
        <legend className="mb-2 text-ink-soft text-label">{copy.inject}</legend>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" disabled={!canInject} onClick={injectCraving}>
            {copy.injectCraving}
          </Button>
          <Button variant="outline" disabled={!canInject} onClick={injectLapse}>
            {copy.injectLapse}
          </Button>
        </div>
      </fieldset>
    </>
  )
}
