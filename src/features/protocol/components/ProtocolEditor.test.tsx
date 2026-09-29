import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { derive } from '@/shared/domain/derive'
import { emptyJournal, type Journal } from '@/shared/domain/journal'
import { DAY_MS } from '@/shared/utils/duration'
import { factId } from '@/shared/utils/fact-id'
import { strings } from '@/shared/utils/strings'
import { ProtocolEditor } from './ProtocolEditor'

const copy = strings.protocol
const QUIT = Date.UTC(2026, 4, 4, 9, 0)
const journal: Journal = {
  ...emptyJournal,
  facts: [{ type: 'quit-moment', id: factId(1), at: QUIT }],
  protocol: [
    { doseMg: 21, durationDays: 28, brand: 'Nicopatch' },
    { doseMg: 14, durationDays: 28 },
  ],
}
/** Protocol day 31: the second step is running, the first one is behind. */
const NOW = QUIT + 30 * DAY_MS

const renderEditor = (onSaved = vi.fn()) => {
  render(
    <ProtocolEditor journal={journal} position={derive(journal, NOW).protocol} onSaved={onSaved} />,
  )
  return onSaved
}
const step = (number: number) => screen.getByRole('group', { name: copy.step(number) })
const save = () => screen.getByRole('button', { name: copy.save })

it('marks the running step and the ones behind it', () => {
  renderEditor()

  expect(step(1)).toHaveAccessibleDescription(copy.status.past)
  expect(step(2)).toHaveAccessibleDescription(copy.status.current)
})

it('keeps the running mark on its step when the step moves, and none on an added step', async () => {
  renderEditor()

  await userEvent.click(screen.getByRole('button', { name: copy.moveUp(2) }))
  await userEvent.click(screen.getByRole('button', { name: copy.add }))

  expect(step(1)).toHaveAccessibleDescription(copy.status.current)
  expect(step(2)).toHaveAccessibleDescription(copy.status.past)
  expect(step(3)).not.toHaveAccessibleDescription()
})

it('keeps save disabled while the protocol in force is untouched', () => {
  renderEditor()

  expect(save()).toBeDisabled()
})

it('wakes save on a changed step and puts it back to sleep once the change is undone', async () => {
  renderEditor()
  const dose = within(step(1)).getByLabelText(copy.doseLabel)

  await userEvent.clear(dose)
  await userEvent.type(dose, '25')
  expect(save()).toBeEnabled()

  await userEvent.clear(dose)
  await userEvent.type(dose, '21')
  expect(save()).toBeDisabled()
})

it('wakes save on an added step and puts it back to sleep once it is removed', async () => {
  renderEditor()

  await userEvent.click(screen.getByRole('button', { name: copy.add }))
  expect(save()).toBeEnabled()

  await userEvent.click(screen.getByRole('button', { name: copy.remove(3) }))
  expect(save()).toBeDisabled()
})

it('wakes save on a removed step', async () => {
  renderEditor()

  await userEvent.click(screen.getByRole('button', { name: copy.remove(2) }))

  expect(save()).toBeEnabled()
})

it('drops a refusal once the protocol in force is back', async () => {
  const onSaved = renderEditor()
  const dose = within(step(2)).getByLabelText(copy.doseLabel)

  await userEvent.clear(dose)
  await userEvent.click(save())
  expect(screen.getByRole('alert')).toHaveTextContent(copy.invalid)

  await userEvent.type(dose, '14')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(dose).not.toHaveAttribute('aria-invalid', 'true')
  expect(save()).toBeDisabled()
  expect(onSaved).not.toHaveBeenCalled()
})

it('saves a changed protocol', async () => {
  const onSaved = renderEditor()

  await userEvent.type(within(step(2)).getByLabelText(copy.brandLabel), 'Niquitin')
  await userEvent.click(save())

  expect(onSaved).toHaveBeenCalledWith({
    ...journal,
    protocol: [
      { doseMg: 21, durationDays: 28, brand: 'Nicopatch' },
      { doseMg: 14, durationDays: 28, brand: 'Niquitin' },
    ],
  })
})
