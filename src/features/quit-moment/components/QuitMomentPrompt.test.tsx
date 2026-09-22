import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { emptyJournal } from '@/shared/domain/journal'
import { strings } from '@/shared/utils/strings'
import { QuitMomentPrompt } from './QuitMomentPrompt'

const NOW = new Date(2026, 8, 22, 10, 0).getTime()

it('refuses a quit moment in the future and says so', async () => {
  const onRecorded = vi.fn()
  render(<QuitMomentPrompt journal={emptyJournal} now={NOW} onRecorded={onRecorded} />)

  const input = screen.getByLabelText(strings.quitMoment.dateLabel)
  await userEvent.clear(input)
  await userEvent.type(input, '2026-09-23T10:00')
  await userEvent.click(screen.getByRole('button', { name: strings.quitMoment.submit }))

  expect(screen.getByRole('alert')).toHaveTextContent(strings.quitMoment.future)
  expect(onRecorded).not.toHaveBeenCalled()
})
