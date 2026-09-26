import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { emptyJournal } from '@/shared/domain/journal'
import { strings } from '@/shared/utils/strings'
import { QuitMomentStep } from './QuitMomentStep'

const NOW = new Date(2026, 8, 22, 10, 0).getTime()

it('refuses a quit moment in the future and says so', async () => {
  const onPicked = vi.fn()
  render(<QuitMomentStep journal={emptyJournal} now={NOW} initial={null} onPicked={onPicked} />)

  const input = screen.getByLabelText(strings.quitMoment.dateLabel)
  await userEvent.clear(input)
  await userEvent.type(input, '2026-09-23T10:00')
  await userEvent.click(screen.getByRole('button', { name: strings.quitMoment.submit }))

  expect(screen.getByRole('alert')).toHaveTextContent(strings.quitMoment.future)
  expect(onPicked).not.toHaveBeenCalled()
})

it('says so when the date is empty or unreadable instead of doing nothing', async () => {
  const onPicked = vi.fn()
  render(<QuitMomentStep journal={emptyJournal} now={NOW} initial={null} onPicked={onPicked} />)

  await userEvent.clear(screen.getByLabelText(strings.quitMoment.dateLabel))
  await userEvent.click(screen.getByRole('button', { name: strings.quitMoment.submit }))

  expect(screen.getByRole('alert')).toHaveTextContent(strings.quitMoment.invalid)
  expect(onPicked).not.toHaveBeenCalled()
})
