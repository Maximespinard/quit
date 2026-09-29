import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { emptyJournal, type Journal } from '@/shared/domain/journal'
import { factId } from '@/shared/utils/fact-id'
import { strings } from '@/shared/utils/strings'
import { SettingsForm } from './SettingsForm'

const QUIT = new Date(2026, 0, 10, 8, 0).getTime()
const NOW = new Date(2026, 0, 20, 12, 0).getTime()
const copy = strings.settings

const journal: Journal = {
  ...emptyJournal,
  facts: [{ type: 'quit-moment', id: factId(1), at: QUIT }],
  weeklySpendCents: 3500,
  baselineSmokesPerDay: 15,
}

const field = (label: string) => screen.getByLabelText(label)
const saveButton = () => screen.getByRole('button', { name: copy.save })

async function retype(label: string, text: string) {
  await userEvent.clear(field(label))
  await userEvent.type(field(label), text)
}

it('has one save for the whole screen, asleep until a value changes', async () => {
  render(<SettingsForm journal={journal} now={NOW} onSaved={vi.fn()} />)

  expect(screen.getAllByRole('button')).toHaveLength(1)
  expect(saveButton()).toBeDisabled()
  await retype(copy.baseline.label, '20')
  expect(saveButton()).toBeEnabled()
  await retype(copy.baseline.label, '15')
  expect(saveButton()).toBeDisabled()
})

it('saves every changed value in one journal', async () => {
  const onSaved = vi.fn()
  render(<SettingsForm journal={journal} now={NOW} onSaved={onSaved} />)

  await retype(copy.spend.label, '48,90')
  await retype(copy.baseline.label, '20')
  await userEvent.click(saveButton())

  expect(onSaved).toHaveBeenCalledWith({
    ...journal,
    weeklySpendCents: 4890,
    baselineSmokesPerDay: 20,
  })
})

it('says under each refused field why, and saves nothing', async () => {
  const onSaved = vi.fn()
  render(<SettingsForm journal={journal} now={NOW} onSaved={onSaved} />)

  await retype(copy.spend.label, '-5')
  await retype(copy.baseline.label, '0')
  await userEvent.click(saveButton())

  expect(onSaved).not.toHaveBeenCalled()
  expect(field(copy.spend.label)).toHaveAccessibleDescription(strings.money['invalid-spend'])
  expect(field(copy.baseline.label)).toHaveAccessibleDescription(
    strings.baseline['invalid-baseline'],
  )
  expect(field(copy.quitMoment.label)).toHaveAttribute('aria-invalid', 'false')

  // Editing a refused field takes its message away; the other one stays until fixed.
  await userEvent.type(field(copy.spend.label), '0')
  expect(field(copy.spend.label)).toHaveAttribute('aria-invalid', 'false')
  expect(screen.getAllByRole('alert')).toHaveLength(1)
})

it('refuses a quit moment in the future', async () => {
  render(<SettingsForm journal={journal} now={NOW} onSaved={vi.fn()} />)

  await retype(copy.quitMoment.label, '2026-01-21T09:00')
  await userEvent.click(saveButton())

  expect(screen.getByRole('alert')).toHaveTextContent(strings.quitMoment.future)
})
