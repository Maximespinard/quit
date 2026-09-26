import { Check } from 'lucide-react'
import { scenarios } from '@/shared/domain/scenarios'
import type { SandboxControls } from '@/shared/hooks/useJournalSource'
import { Button } from '@/shared/ui/base/button'
import { strings } from '@/shared/utils/strings'

const copy = strings.debug

/**
 * The scenarios by name, one tap each: the tap replaces the sandbox journal and stops its
 * clock on the scenario's. The one loaded last is marked current until the sandbox is wiped.
 */
export function ScenarioPicker({ sandbox }: { sandbox: SandboxControls }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-ink-soft text-label">{copy.scenarios}</legend>
      {scenarios.map((scenario) => {
        const active = scenario.id === sandbox.scenario
        return (
          <Button
            key={scenario.id}
            variant={active ? 'secondary' : 'outline'}
            size="sm"
            className="justify-between"
            aria-current={active ? 'true' : undefined}
            onClick={() => void sandbox.loadScenario(scenario)}
          >
            {copy.scenario[scenario.id]}
            {active ? <Check aria-hidden="true" className="size-4" /> : null}
          </Button>
        )
      })}
    </fieldset>
  )
}
