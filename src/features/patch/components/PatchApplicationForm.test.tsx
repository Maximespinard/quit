import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { emptyJournal, type Journal } from '@/shared/domain/journal'
import { protocolPosition } from '@/shared/domain/protocol-position'
import { strings } from '@/shared/utils/strings'
import { PatchApplicationForm } from './PatchApplicationForm'

const QUIT_MOMENT = new Date(2026, 8, 20, 8, 0).getTime()
const NOW = new Date(2026, 8, 22, 10, 0).getTime()
const journal: Journal = { ...emptyJournal, facts: [{ type: 'quit-moment', at: QUIT_MOMENT }] }
const position = protocolPosition(journal.protocol, QUIT_MOMENT, NOW)
const copy = strings.patch.form
const initial = { at: new Date(2026, 8, 21, 23, 40, 12).getTime(), doseMg: 10.5 }

const renderEdit = (onRecorded = vi.fn()) => {
  render(
    <PatchApplicationForm
      journal={journal}
      position={position}
      now={NOW}
      initial={initial}
      onRecorded={onRecorded}
    />,
  )
  return onRecorded
}

it('edits a patch application from its own dose and time, kept exact when untouched', async () => {
  const onRecorded = renderEdit()

  expect(screen.getByRole('heading', { name: copy.edit.title })).toBeVisible()
  expect(screen.getByLabelText(copy.doseLabel)).toHaveValue('10,5')
  expect(screen.getByLabelText(copy.dateLabel)).toHaveValue('2026-09-21T23:40')
  await userEvent.click(screen.getByRole('button', { name: copy.edit.submit }))

  expect(onRecorded).toHaveBeenCalledWith({
    ...journal,
    facts: [...journal.facts, { type: 'patch-application', ...initial }],
  })
})

it('moves a patch application across midnight', async () => {
  const onRecorded = renderEdit()

  const date = screen.getByLabelText(copy.dateLabel)
  await userEvent.clear(date)
  await userEvent.type(date, '2026-09-22T00:20')
  await userEvent.click(screen.getByRole('button', { name: copy.edit.submit }))

  expect(onRecorded).toHaveBeenCalledWith({
    ...journal,
    facts: [
      ...journal.facts,
      { type: 'patch-application', at: new Date(2026, 8, 22, 0, 20).getTime(), doseMg: 10.5 },
    ],
  })
})

it('refuses a time in the future, as at creation', async () => {
  const onRecorded = renderEdit()

  const date = screen.getByLabelText(copy.dateLabel)
  await userEvent.clear(date)
  await userEvent.type(date, '2026-09-22T11:00')
  await userEvent.click(screen.getByRole('button', { name: copy.edit.submit }))

  expect(screen.getByRole('alert')).toHaveTextContent(copy.future)
  expect(onRecorded).not.toHaveBeenCalled()
})
