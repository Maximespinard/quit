import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { emptyJournal, type Journal } from '@/shared/domain/journal'
import { strings } from '@/shared/utils/strings'
import { LapseForm } from './LapseForm'

const NOW = new Date(2026, 8, 22, 10, 0).getTime()
const QUIT_MOMENT = new Date(2026, 8, 20, 8, 0).getTime()
const journal: Journal = { ...emptyJournal, facts: [{ type: 'quit-moment', at: QUIT_MOMENT }] }
const copy = strings.lapse

const fillAndConfirm = async (value: string) => {
  const input = screen.getByLabelText(copy.dateLabel)
  await userEvent.clear(input)
  if (value !== '') await userEvent.type(input, value)
  await userEvent.click(screen.getByRole('button', { name: copy.confirm }))
}

it('records nothing until the lapse is confirmed', async () => {
  const onRecorded = vi.fn()
  render(<LapseForm journal={journal} now={NOW} onRecorded={onRecorded} />)

  expect(screen.getByLabelText(copy.dateLabel)).toHaveValue('2026-09-22T10:00')
  expect(onRecorded).not.toHaveBeenCalled()

  await userEvent.click(screen.getByRole('button', { name: copy.confirm }))

  expect(onRecorded).toHaveBeenCalledWith({
    ...journal,
    facts: [...journal.facts, { type: 'lapse', at: NOW }],
  })
})

it('records a backdated lapse', async () => {
  const onRecorded = vi.fn()
  render(<LapseForm journal={journal} now={NOW} onRecorded={onRecorded} />)

  await fillAndConfirm('2026-09-21T23:00')

  expect(onRecorded).toHaveBeenCalledWith({
    ...journal,
    facts: [...journal.facts, { type: 'lapse', at: new Date(2026, 8, 21, 23, 0).getTime() }],
  })
})

it.each([
  ['in the future', '2026-09-22T11:00', copy.future],
  ['before the quit moment', '2026-09-20T07:59', copy['before-quit-moment']],
  ['with no date', '', copy.invalid],
])('refuses a lapse %s and says why', async (_, value, message) => {
  const onRecorded = vi.fn()
  render(<LapseForm journal={journal} now={NOW} onRecorded={onRecorded} />)

  await fillAndConfirm(value)

  expect(screen.getByRole('alert')).toHaveTextContent(message)
  expect(onRecorded).not.toHaveBeenCalled()
})
