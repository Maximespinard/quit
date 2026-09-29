import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { factId } from '@/shared/utils/fact-id'
import { strings } from '@/shared/utils/strings'
import { DeleteFact } from './DeleteFact'

const copy = strings.history

it('deletes any fact but a lapse in one tap', async () => {
  const onDelete = vi.fn()
  render(
    <DeleteFact
      fact={{ type: 'craving', id: factId(1), at: 0, intensity: 1, heldToEnd: false, tags: [] }}
      onDelete={onDelete}
    />,
  )

  await userEvent.click(screen.getByRole('button', { name: copy.delete }))

  expect(onDelete).toHaveBeenCalledOnce()
})

it('asks before deleting a lapse, and keeps it when the user says so', async () => {
  const onDelete = vi.fn()
  render(
    <DeleteFact fact={{ type: 'lapse', id: factId(1), at: 0, count: 1 }} onDelete={onDelete} />,
  )

  await userEvent.click(screen.getByRole('button', { name: copy.delete }))
  expect(onDelete).not.toHaveBeenCalled()
  expect(screen.getByRole('dialog', { name: copy.confirmLapseDelete.title })).toBeVisible()

  await userEvent.click(screen.getByRole('button', { name: copy.confirmLapseDelete.cancel }))
  expect(onDelete).not.toHaveBeenCalled()

  await userEvent.click(screen.getByRole('button', { name: copy.delete }))
  await userEvent.click(screen.getByRole('button', { name: copy.confirmLapseDelete.confirm }))
  expect(onDelete).toHaveBeenCalledOnce()
})
