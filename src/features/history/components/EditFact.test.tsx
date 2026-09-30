import type { Fact } from '@quit/contract/facts'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { emptyJournal, type Journal } from '@/shared/domain/journal'
import { factId } from '@/shared/utils/fact-id'
import { strings } from '@/shared/utils/strings'
import type { FactForms } from '../types/edit-fact'
import { EditFact } from './EditFact'

const copy = strings.history
const QUIT = Date.UTC(2026, 8, 1, 8)
const NOW = QUIT + 3 * 24 * 60 * 60_000

const quitMoment: Fact = { type: 'quit-moment', id: factId(1), at: QUIT }
const lapse: Fact = { type: 'lapse', id: factId(2), at: QUIT + 60_000, count: 1 }
const craving: Fact = {
  type: 'craving',
  id: factId(3),
  at: QUIT + 120_000,
  intensity: 2,
  heldToEnd: true,
  tags: [],
}
const patch: Fact = { type: 'patch-application', id: factId(4), at: QUIT + 180_000, doseMg: 21 }

const journalOf = (...facts: Fact[]): Journal => ({ ...emptyJournal, facts })

/** Each form names the fact it was given and shows what sits under it. */
const forms: FactForms = {
  lapse: (fact, { secondary }) => (
    <>
      <p>lapse {fact.count}</p>
      {secondary}
    </>
  ),
  craving: (fact, { secondary }) => (
    <>
      <p>craving {fact.intensity}</p>
      {secondary}
    </>
  ),
  'patch-application': (fact, { position, secondary }) => (
    <>
      <p>
        patch {fact.doseMg} {position.status}
      </p>
      {secondary}
    </>
  ),
}

function renderEdit(journal: Journal, id = factId(2)) {
  const onEdited = vi.fn()
  const onDeleted = vi.fn()
  render(
    <EditFact
      journal={journal}
      factId={id}
      now={NOW}
      forms={forms}
      onEdited={onEdited}
      onDeleted={onDeleted}
      back={<a href="/history">{copy.back}</a>}
    />,
  )
  return { onEdited, onDeleted }
}

it('opens the form of the fact’s own type, the delete and the way back under it', () => {
  renderEdit(journalOf(quitMoment, lapse, craving, patch), factId(3))

  expect(screen.getByText('craving 2')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: copy.delete })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: copy.back })).toBeInTheDocument()
})

it('opens a patch application against the protocol position in force', () => {
  renderEdit(journalOf(quitMoment, patch), factId(4))

  expect(screen.getByText('patch 21 running')).toBeInTheDocument()
})

it('offers only delete and back for a patch application with no protocol to place it in', () => {
  renderEdit(journalOf(patch), factId(4))

  expect(screen.queryByText(/^patch/)).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: copy.delete })).toBeInTheDocument()
})

it('deletes by handing over the journal without the fact', async () => {
  const { onDeleted } = renderEdit(journalOf(quitMoment, lapse, craving), factId(3))

  await userEvent.click(screen.getByRole('button', { name: copy.delete }))

  expect(onDeleted).toHaveBeenCalledWith(journalOf(quitMoment, lapse))
})

it('says a fact is gone when its id is unknown, with the way back only', () => {
  renderEdit(journalOf(quitMoment), factId(9))

  expect(screen.getByText(copy.missing)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: copy.delete })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: copy.back })).toBeInTheDocument()
})
