import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PatchApplicationInput } from '@/shared/domain/facts/patch-application'
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

const sites = strings.patch.sites

const renderForm = (initialApplication?: PatchApplicationInput) => {
  const onRecorded = vi.fn()
  render(
    <PatchApplicationForm
      journal={journal}
      position={position}
      suggestedSite="chest-left"
      now={NOW}
      {...(initialApplication ? { initial: initialApplication } : {})}
      onRecorded={onRecorded}
    />,
  )
  return onRecorded
}
const renderEdit = () => renderForm(initial)
const site = (name: string) => screen.getByRole('button', { name })

it('logs a patch application at the suggested site unless another or none is pressed', async () => {
  const onRecorded = renderForm()

  expect(site(sites['chest-left'])).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(site(sites['hip-right']))
  expect(site(sites['chest-left'])).toHaveAttribute('aria-pressed', 'false')
  await userEvent.click(screen.getByRole('button', { name: copy.submit }))

  expect(onRecorded).toHaveBeenLastCalledWith({
    ...journal,
    facts: [
      ...journal.facts,
      { type: 'patch-application', at: NOW, doseMg: 21, site: 'hip-right' },
    ],
  })
})

it('logs a patch application without a site once the pressed one is pressed again', async () => {
  const onRecorded = renderForm()

  await userEvent.click(site(sites['chest-left']))
  await userEvent.click(screen.getByRole('button', { name: copy.submit }))

  expect(onRecorded).toHaveBeenLastCalledWith({
    ...journal,
    facts: [...journal.facts, { type: 'patch-application', at: NOW, doseMg: 21 }],
  })
})

it('edits a patch application from its own site, not the suggested one', async () => {
  const onRecorded = renderForm({ ...initial, site: 'arm-right' })

  expect(site(sites['arm-right'])).toHaveAttribute('aria-pressed', 'true')
  expect(site(sites['chest-left'])).toHaveAttribute('aria-pressed', 'false')
  await userEvent.click(screen.getByRole('button', { name: copy.edit.submit }))

  expect(onRecorded).toHaveBeenCalledWith({
    ...journal,
    facts: [...journal.facts, { type: 'patch-application', ...initial, site: 'arm-right' }],
  })
})

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
