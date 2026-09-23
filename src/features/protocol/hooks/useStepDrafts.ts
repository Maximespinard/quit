import { useState } from 'react'
import type { Protocol } from '@/shared/domain/protocol'
import { type DraftField, draftsFrom, moveDraft, type StepDraft } from '../utils/step-draft'

/** The editor's working copy of the protocol: nothing reaches the journal until it is saved. */
export function useStepDrafts(protocol: Protocol) {
  const [drafts, setDrafts] = useState<readonly StepDraft[]>(() => draftsFrom(protocol))
  const [nextId, setNextId] = useState(protocol.length)

  const update = (id: number, field: DraftField, value: string) =>
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, [field]: value } : draft)),
    )

  /** A new step starts as a copy of the last one's dose and duration, brand left blank. */
  const add = () => {
    const last = drafts[drafts.length - 1]
    setDrafts([
      ...drafts,
      { id: nextId, dose: last?.dose ?? '', duration: last?.duration ?? '', brand: '' },
    ])
    setNextId(nextId + 1)
  }

  const remove = (id: number) => setDrafts((current) => current.filter((draft) => draft.id !== id))

  const move = (index: number, offset: -1 | 1) =>
    setDrafts((current) => moveDraft(current, index, offset))

  return { drafts, update, add, remove, move }
}
