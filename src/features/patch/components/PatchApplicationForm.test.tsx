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

const renderForm = (initialApplication?: PatchApplicationInput, withFacts = journal) => {
  const onRecorded = vi.fn()
  render(
    <PatchApplicationForm
      journal={withFacts}
      position={position}
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

  expect(site(sites['arm-left'])).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(site(sites['hip-right']))
  expect(site(sites['arm-left'])).toHaveAttribute('aria-pressed', 'false')
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

  await userEvent.click(site(sites['arm-left']))
  await userEvent.click(screen.getByRole('button', { name: copy.submit }))

  expect(onRecorded).toHaveBeenLastCalledWith({
    ...journal,
    facts: [...journal.facts, { type: 'patch-application', at: NOW, doseMg: 21 }],
  })
})

it('suggests the site for the date entered when catching up a day', async () => {
  const withSites: Journal = {
    ...journal,
    facts: [
      ...journal.facts,
      {
        type: 'patch-application',
        at: new Date(2026, 8, 20, 9, 0).getTime(),
        doseMg: 21,
        site: 'arm-right',
      },
      {
        type: 'patch-application',
        at: new Date(2026, 8, 22, 9, 0).getTime(),
        doseMg: 21,
        site: 'hip-left',
      },
    ],
  }
  const onRecorded = renderForm(undefined, withSites)
  expect(site(sites['hip-right'])).toHaveAttribute('aria-pressed', 'true')

  // The day between the two: the site after the 20th's, not after the 22nd's.
  const date = screen.getByLabelText(copy.dateLabel)
  await userEvent.clear(date)
  await userEvent.type(date, '2026-09-21T09:00')
  expect(site(sites['chest-left'])).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(screen.getByRole('button', { name: copy.submit }))

  expect(onRecorded).toHaveBeenLastCalledWith({
    ...withSites,
    facts: [
      ...withSites.facts,
      {
        type: 'patch-application',
        at: new Date(2026, 8, 21, 9, 0).getTime(),
        doseMg: 21,
        site: 'chest-left',
      },
    ],
  })
})

it('edits a patch application from its own site, not the suggested one', async () => {
  const onRecorded = renderForm({ ...initial, site: 'arm-right' })

  expect(site(sites['arm-right'])).toHaveAttribute('aria-pressed', 'true')
  expect(site(sites['arm-left'])).toHaveAttribute('aria-pressed', 'false')
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
