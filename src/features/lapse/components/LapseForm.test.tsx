import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { emptyJournal, type Journal } from '@/shared/domain/journal'
import { anyFactId } from '@/shared/test/fact-ids'
import { factId } from '@/shared/utils/fact-id'
import { strings } from '@/shared/utils/strings'
import { LapseForm } from './LapseForm'

const NOW = new Date(2026, 8, 22, 10, 0).getTime()
const QUIT_MOMENT = new Date(2026, 8, 20, 8, 0).getTime()
const journal: Journal = {
  ...emptyJournal,
  facts: [{ type: 'quit-moment', id: factId(1), at: QUIT_MOMENT }],
}
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
    facts: [...journal.facts, { type: 'lapse', id: anyFactId, at: NOW, count: 1 }],
  })
})

it('records a backdated lapse', async () => {
  const onRecorded = vi.fn()
  render(<LapseForm journal={journal} now={NOW} onRecorded={onRecorded} />)

  await fillAndConfirm('2026-09-21T23:00')

  expect(onRecorded).toHaveBeenCalledWith({
    ...journal,
    facts: [
      ...journal.facts,
      { type: 'lapse', id: anyFactId, at: new Date(2026, 8, 21, 23, 0).getTime(), count: 1 },
    ],
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

it('records now to the millisecond when the time is left untouched', async () => {
  const onRecorded = vi.fn()
  const now = NOW + 42_500
  render(<LapseForm journal={journal} now={now} onRecorded={onRecorded} />)

  await userEvent.click(screen.getByRole('button', { name: copy.confirm }))

  expect(onRecorded).toHaveBeenCalledWith({
    ...journal,
    facts: [...journal.facts, { type: 'lapse', id: anyFactId, at: now, count: 1 }],
  })
})

it('records the number of cigarettes, one by default and never fewer', async () => {
  const onRecorded = vi.fn()
  render(<LapseForm journal={journal} now={NOW} onRecorded={onRecorded} />)

  expect(screen.getByRole('button', { name: copy.fewer })).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: copy.more }))
  await userEvent.click(screen.getByRole('button', { name: copy.more }))
  await userEvent.click(screen.getByRole('button', { name: copy.fewer }))
  await userEvent.click(screen.getByRole('button', { name: copy.confirm }))

  expect(onRecorded).toHaveBeenCalledWith({
    ...journal,
    facts: [...journal.facts, { type: 'lapse', id: anyFactId, at: NOW, count: 2 }],
  })
})

describe('the relapse a lapse would trigger', () => {
  const lapse = (n: number, at: number) => ({ type: 'lapse' as const, id: factId(n), at, count: 1 })
  const twoDaysOfLapses: Journal = {
    ...journal,
    facts: [
      ...journal.facts,
      lapse(2, new Date(2026, 8, 20, 21, 0).getTime()),
      lapse(3, new Date(2026, 8, 21, 21, 0).getTime()),
    ],
  }

  it('is named, with its cost, before the lapse is confirmed', () => {
    render(<LapseForm journal={twoDaysOfLapses} now={NOW} onRecorded={vi.fn()} />)

    expect(screen.getByText(copy.relapseTitle)).toBeVisible()
    expect(screen.getByText(copy.relapseCost)).toBeVisible()
  })

  it('is not mentioned for a slip', () => {
    render(<LapseForm journal={journal} now={NOW} onRecorded={vi.fn()} />)

    expect(screen.queryByText(copy.relapseTitle)).toBeNull()
  })

  it('follows the time picked: a day that breaks the run is a slip', async () => {
    render(<LapseForm journal={twoDaysOfLapses} now={NOW} onRecorded={vi.fn()} />)
    const input = screen.getByLabelText(copy.dateLabel)

    await userEvent.clear(input)
    await userEvent.type(input, '2026-09-20T08:30')

    expect(screen.queryByText(copy.relapseTitle)).toBeNull()
  })
})

describe('editing a lapse', () => {
  const initial = { id: factId(7), at: new Date(2026, 8, 21, 22, 15, 42).getTime(), count: 3 }

  it('starts from the lapse and, left untouched, keeps its exact instant and its id', async () => {
    const onRecorded = vi.fn()
    render(<LapseForm journal={journal} now={NOW} initial={initial} onRecorded={onRecorded} />)

    expect(screen.getByLabelText(copy.dateLabel)).toHaveValue('2026-09-21T22:15')
    await userEvent.click(screen.getByRole('button', { name: copy.fewer }))
    await userEvent.click(screen.getByRole('button', { name: copy.edit.confirm }))

    expect(onRecorded).toHaveBeenCalledWith({
      ...journal,
      facts: [...journal.facts, { type: 'lapse', id: initial.id, at: initial.at, count: 2 }],
    })
  })

  it('refuses a new time before the quit moment, as at creation', async () => {
    const onRecorded = vi.fn()
    render(<LapseForm journal={journal} now={NOW} initial={initial} onRecorded={onRecorded} />)

    const input = screen.getByLabelText(copy.dateLabel)
    await userEvent.clear(input)
    await userEvent.type(input, '2026-09-19T23:00')
    await userEvent.click(screen.getByRole('button', { name: copy.edit.confirm }))

    expect(screen.getByRole('alert')).toHaveTextContent(copy['before-quit-moment'])
    expect(onRecorded).not.toHaveBeenCalled()
  })
})
