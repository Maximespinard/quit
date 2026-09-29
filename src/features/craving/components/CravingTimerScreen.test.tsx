import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { emptyJournal, type Journal } from '@/shared/domain/journal'
import { anyFactId } from '@/shared/test/fact-ids'
import { factId } from '@/shared/utils/fact-id'
import { strings } from '@/shared/utils/strings'
import { CravingTimerScreen } from './CravingTimerScreen'

const SECOND = 1_000
const MINUTE = 60 * SECOND
const STARTED_AT = Date.UTC(2026, 8, 22, 10, 0, 0)
const copy = strings.craving

const renderTimer = (props: { now: number; stoppedAt?: number; journal?: Journal }) => {
  const onStop = vi.fn()
  const onRecorded = vi.fn()
  render(
    <CravingTimerScreen
      journal={props.journal ?? emptyJournal}
      now={props.now}
      startedAt={STARTED_AT}
      stoppedAt={props.stoppedAt ?? null}
      onStop={onStop}
      onRecorded={onRecorded}
    />,
  )
  return { onStop, onRecorded }
}

const rate = async (intensity: string) => {
  await userEvent.click(screen.getByRole('button', { name: intensity }))
  await userEvent.click(screen.getByRole('button', { name: copy.intensity.submit }))
}

it('counts down from the start instant, and asks nothing while it runs', () => {
  renderTimer({ now: STARTED_AT + MINUTE + 15 * SECOND })

  expect(screen.getByRole('timer')).toHaveTextContent('2:45')
  expect(screen.queryByRole('group', { name: copy.intensity.label })).not.toBeInTheDocument()
})

it('stops early on request', async () => {
  const { onStop } = renderTimer({ now: STARTED_AT + MINUTE })

  await userEvent.click(screen.getByRole('button', { name: copy.timer.stop }))

  expect(onStop).toHaveBeenCalledOnce()
})

it('celebrates at the end, then records the rated craving as held to the end', async () => {
  const { onRecorded } = renderTimer({ now: STARTED_AT + 4 * MINUTE })

  expect(screen.getByRole('heading', { name: copy.held.title })).toBeVisible()
  await rate('3')

  expect(onRecorded).toHaveBeenCalledWith({
    ...emptyJournal,
    facts: [
      { type: 'craving', id: anyFactId, at: STARTED_AT, intensity: 3, heldToEnd: true, tags: [] },
    ],
  })
})

it('records a craving stopped early without the full-timer mark and without celebrating', async () => {
  const { onRecorded } = renderTimer({
    now: STARTED_AT + 2 * MINUTE,
    stoppedAt: STARTED_AT + MINUTE,
  })

  expect(screen.queryByRole('heading', { name: copy.held.title })).not.toBeInTheDocument()
  expect(screen.queryByRole('timer')).not.toBeInTheDocument()
  await rate('1')

  expect(onRecorded).toHaveBeenCalledWith({
    ...emptyJournal,
    facts: [
      { type: 'craving', id: anyFactId, at: STARTED_AT, intensity: 1, heldToEnd: false, tags: [] },
    ],
  })
})

it('records the craving once, even on a double tap', async () => {
  const { onRecorded } = renderTimer({ now: STARTED_AT + 4 * MINUTE })

  await userEvent.click(screen.getByRole('button', { name: '2' }))
  await userEvent.dblClick(screen.getByRole('button', { name: copy.intensity.submit }))

  expect(onRecorded).toHaveBeenCalledOnce()
})

it('does not record until an intensity is chosen', async () => {
  const { onRecorded } = renderTimer({ now: STARTED_AT + 4 * MINUTE })

  expect(screen.getByRole('button', { name: copy.intensity.submit })).toBeDisabled()
  expect(onRecorded).not.toHaveBeenCalled()
})

describe('tags', () => {
  const tagGroup = () => screen.queryByRole('group', { name: copy.tags.label })
  const customInput = () => screen.getByLabelText(copy.tags.customLabel)

  it('offers the tags only once the intensity is picked', async () => {
    renderTimer({ now: STARTED_AT + 4 * MINUTE })

    expect(tagGroup()).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '2' }))

    expect(tagGroup()).toBeVisible()
    expect(screen.getByRole('button', { name: 'Café' })).toBeVisible()
  })

  it('records several default tags and a typed one with the craving', async () => {
    const { onRecorded } = renderTimer({ now: STARTED_AT + 4 * MINUTE })

    await userEvent.click(screen.getByRole('button', { name: '2' }))
    await userEvent.click(screen.getByRole('button', { name: 'Café' }))
    await userEvent.click(screen.getByRole('button', { name: 'Stress' }))
    await userEvent.type(customInput(), '  Voiture {Enter}')
    await userEvent.click(screen.getByRole('button', { name: copy.intensity.submit }))

    expect(onRecorded).toHaveBeenCalledWith({
      ...emptyJournal,
      facts: [
        {
          type: 'craving',
          id: anyFactId,
          at: STARTED_AT,
          intensity: 2,
          heldToEnd: true,
          tags: ['coffee', 'stress', 'Voiture'],
        },
      ],
    })
  })

  it('shows a typed tag pressed, and unpressing it leaves it out', async () => {
    const { onRecorded } = renderTimer({ now: STARTED_AT + 4 * MINUTE })

    await userEvent.click(screen.getByRole('button', { name: '1' }))
    await userEvent.type(customInput(), 'Voiture')
    await userEvent.click(screen.getByRole('button', { name: copy.tags.add }))
    const typed = screen.getByRole('button', { name: 'Voiture' })
    expect(typed).toHaveAttribute('aria-pressed', 'true')
    expect(customInput()).toHaveValue('')

    await userEvent.click(typed)
    await userEvent.click(screen.getByRole('button', { name: copy.intensity.submit }))

    expect(onRecorded).toHaveBeenCalledWith(
      expect.objectContaining({ facts: [expect.objectContaining({ tags: [] })] }),
    )
  })

  it('keeps a typed tag left unadded when the craving is recorded', async () => {
    const { onRecorded } = renderTimer({ now: STARTED_AT + 4 * MINUTE })

    await userEvent.click(screen.getByRole('button', { name: '2' }))
    await userEvent.type(customInput(), 'Voiture')
    await userEvent.click(screen.getByRole('button', { name: copy.intensity.submit }))

    expect(onRecorded).toHaveBeenCalledWith(
      expect.objectContaining({ facts: [expect.objectContaining({ tags: ['Voiture'] })] }),
    )
  })

  it('leaves the screen as it is when the field loses focus, so the next tap lands', async () => {
    renderTimer({ now: STARTED_AT + 4 * MINUTE })

    await userEvent.click(screen.getByRole('button', { name: '2' }))
    await userEvent.type(customInput(), 'Métro')
    await userEvent.tab()

    expect(screen.queryByRole('button', { name: 'Métro' })).not.toBeInTheDocument()
    expect(customInput()).toHaveValue('Métro')
  })

  it('merges a typed tag into an offered one differing only by case or spacing', async () => {
    renderTimer({ now: STARTED_AT + 4 * MINUTE })

    await userEvent.click(screen.getByRole('button', { name: '1' }))
    await userEvent.type(customInput(), '  youtube {Enter}')

    expect(screen.getAllByRole('button', { name: 'YouTube' })).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'YouTube' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('offers again the tags typed on past cravings', async () => {
    const journal: Journal = {
      ...emptyJournal,
      facts: [
        {
          type: 'craving',
          id: factId(1),
          at: STARTED_AT - MINUTE,
          intensity: 2,
          heldToEnd: false,
          tags: ['Voiture'],
        },
      ],
    }
    renderTimer({ now: STARTED_AT + 4 * MINUTE, journal })

    await userEvent.click(screen.getByRole('button', { name: '3' }))

    expect(screen.getByRole('button', { name: 'Voiture' })).toHaveAttribute('aria-pressed', 'false')
  })
})
