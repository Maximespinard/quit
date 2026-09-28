import { Plus } from 'lucide-react'
import { type FormEvent, useId, useState } from 'react'
import type { Journal } from '@/shared/domain/journal'
import {
  isSameProtocol,
  isValidDose,
  isValidDuration,
  type SetProtocolResult,
  type Step,
  setProtocol,
} from '@/shared/domain/protocol'
import { Button } from '@/shared/ui/base/button'
import { strings } from '@/shared/utils/strings'
import { useStepDrafts } from '../hooks/useStepDrafts'
import { stepFrom } from '../utils/step-draft'
import { StepFields } from './StepFields'

const copy = strings.protocol

type Refusal = Extract<SetProtocolResult, { ok: false }>['reason']

/** Fields are flagged only once a save was refused, then follow the edits live. */
const invalidFields = (step: Step | undefined, refused: Refusal | null) => ({
  dose: refused !== null && step !== undefined && !isValidDose(step.doseMg),
  duration: refused !== null && step !== undefined && !isValidDuration(step.durationDays),
})

type ProtocolEditorProps = {
  journal: Journal
  onSaved: (journal: Journal) => void
}

/** Edits the whole protocol as a draft; the journal only changes when the draft is saved. */
export function ProtocolEditor({ journal, onSaved }: ProtocolEditorProps) {
  const errorId = useId()
  const { drafts, update, add, remove, move } = useStepDrafts(journal.protocol)
  const [refused, setRefused] = useState<Refusal | null>(null)
  const steps = drafts.map(stepFrom)
  const changed = !isSameProtocol(journal.protocol, steps)
  // Back to the protocol in force: nothing left to refuse, so the refusal goes too.
  if (!changed && refused !== null) setRefused(null)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = setProtocol(journal, steps)
    if (result.ok) onSaved(result.journal)
    else setRefused(result.reason)
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-body text-ink-soft">{copy.lead}</p>

      <ol className="flex flex-col gap-3">
        {drafts.map((draft, index) => (
          <li key={draft.id}>
            <StepFields
              draft={draft}
              number={index + 1}
              isFirst={index === 0}
              isLast={index === drafts.length - 1}
              canRemove={drafts.length > 1}
              invalid={invalidFields(steps[index], refused)}
              errorId={errorId}
              onChange={(field, value) => update(draft.id, field, value)}
              onMove={(offset) => move(index, offset)}
              onRemove={() => remove(draft.id)}
            />
          </li>
        ))}
      </ol>

      <Button variant="secondary" onClick={add}>
        <Plus strokeWidth={1.75} aria-hidden="true" />
        {copy.add}
      </Button>

      {refused !== null ? (
        <p id={errorId} role="alert" className="text-alert text-label">
          {copy[refused]}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={!changed}>
        {copy.save}
      </Button>
    </form>
  )
}
