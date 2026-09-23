import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { emptyJournal } from '@/shared/domain/journal'
import { strings } from '@/shared/utils/strings'
import { CravingTimerScreen } from './CravingTimerScreen'

const SECOND = 1_000
const MINUTE = 60 * SECOND
const STARTED_AT = Date.UTC(2026, 8, 22, 10, 0, 0)
const copy = strings.craving

const renderTimer = (props: { now: number; stoppedAt?: number }) => {
  const onStop = vi.fn()
  const onRecorded = vi.fn()
  render(
    <CravingTimerScreen
      journal={emptyJournal}
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
    facts: [{ type: 'craving', at: STARTED_AT, intensity: 3, heldToEnd: true }],
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
    facts: [{ type: 'craving', at: STARTED_AT, intensity: 1, heldToEnd: false }],
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
