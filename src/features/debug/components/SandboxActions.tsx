import { derive } from '@/shared/domain/derive'
import { recordCraving } from '@/shared/domain/facts/craving'
import { recordLapse } from '@/shared/domain/facts/lapse'
import type { Journal } from '@/shared/domain/journal'
import type { SandboxControls } from '@/shared/hooks/useJournalSource'
import { Button } from '@/shared/ui/base/button'
import { newFactId } from '@/shared/utils/fact-id'
import { strings } from '@/shared/utils/strings'
import { INJECTED_CRAVING, INJECTED_LAPSE } from '../utils/injected-facts'

const copy = strings.debug

type RecordResult = { readonly ok: true; readonly journal: Journal } | { readonly ok: false }

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
  const running = derived.protocol?.status === 'running' ? derived.protocol : null
  const canInject = derived.quitMoment !== null

  const inject = (result: RecordResult) => {
    if (result.ok) void commit(result.journal)
  }
  const injectCraving = () =>
    inject(recordCraving(journal, { id: newFactId(), at: now, ...INJECTED_CRAVING }, now))
  const injectLapse = () =>
    inject(recordLapse(journal, { id: newFactId(), at: now, ...INJECTED_LAPSE }, now))

  return (
    <>
      <Button
        variant="secondary"
        disabled={running === null}
        onClick={() => {
          if (running !== null) sandbox.stopClockAt(running.endsAt)
        }}
      >
        {running?.nextStep === null ? copy.jumpToEnd : copy.jumpToNextStep}
      </Button>
      <fieldset>
        <legend className="mb-2 text-muted text-label">{copy.inject}</legend>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" disabled={!canInject} onClick={injectCraving}>
            {copy.injectCraving}
          </Button>
          <Button variant="secondary" disabled={!canInject} onClick={injectLapse}>
            {copy.injectLapse}
          </Button>
        </div>
      </fieldset>
    </>
  )
}
