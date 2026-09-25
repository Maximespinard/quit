import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { emptyJournal } from '@/shared/domain/journal'
import { strings } from '@/shared/utils/strings'
import { PastCravingForm } from './PastCravingForm'

const NOW = new Date(2026, 8, 22, 10, 0).getTime()
const copy = strings.craving

const fillAndSubmit = async (value: string, intensity: string) => {
  const input = screen.getByLabelText(copy.past.dateLabel)
  await userEvent.clear(input)
  if (value !== '') await userEvent.type(input, value)
  await userEvent.click(screen.getByRole('button', { name: intensity }))
  await userEvent.click(screen.getByRole('button', { name: copy.intensity.submit }))
}

it('records a backdated craving, never marked as held to the end', async () => {
  const onRecorded = vi.fn()
  render(<PastCravingForm journal={emptyJournal} now={NOW} onRecorded={onRecorded} />)

  await fillAndSubmit('2026-09-22T08:30', '2')

  expect(onRecorded).toHaveBeenCalledWith({
    ...emptyJournal,
    facts: [
      {
        type: 'craving',
        at: new Date(2026, 8, 22, 8, 30).getTime(),
        intensity: 2,
        heldToEnd: false,
        tags: [],
      },
    ],
  })
})

it('records the tags of a backdated craving', async () => {
  const onRecorded = vi.fn()
  render(<PastCravingForm journal={emptyJournal} now={NOW} onRecorded={onRecorded} />)

  await userEvent.click(screen.getByRole('button', { name: '3' }))
  await userEvent.click(screen.getByRole('button', { name: 'Repas' }))
  await userEvent.click(screen.getByRole('button', { name: copy.intensity.submit }))

  expect(onRecorded).toHaveBeenCalledWith({
    ...emptyJournal,
    facts: [{ type: 'craving', at: NOW, intensity: 3, heldToEnd: false, tags: ['meal'] }],
  })
})

it('refuses a craving in the future and says so', async () => {
  const onRecorded = vi.fn()
  render(<PastCravingForm journal={emptyJournal} now={NOW} onRecorded={onRecorded} />)

  await fillAndSubmit('2026-09-22T11:00', '2')

  expect(screen.getByRole('alert')).toHaveTextContent(copy.past.future)
  expect(onRecorded).not.toHaveBeenCalled()
})

it('says so when the date is empty instead of doing nothing', async () => {
  const onRecorded = vi.fn()
  render(<PastCravingForm journal={emptyJournal} now={NOW} onRecorded={onRecorded} />)

  await fillAndSubmit('', '1')

  expect(screen.getByRole('alert')).toHaveTextContent(copy.past.invalid)
  expect(onRecorded).not.toHaveBeenCalled()
})
