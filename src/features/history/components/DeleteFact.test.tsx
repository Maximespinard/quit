import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { strings } from '@/shared/utils/strings'
import { DeleteFact } from './DeleteFact'

const copy = strings.history

it('deletes in one tap a fact that asks for no confirmation', async () => {
  const onDelete = vi.fn()
  render(<DeleteFact confirm={false} onDelete={onDelete} />)

  await userEvent.click(screen.getByRole('button', { name: copy.delete }))

  expect(onDelete).toHaveBeenCalledOnce()
})

it('asks before deleting a lapse, and keeps it when the user says so', async () => {
  const onDelete = vi.fn()
  render(<DeleteFact confirm onDelete={onDelete} />)

  await userEvent.click(screen.getByRole('button', { name: copy.delete }))
  expect(onDelete).not.toHaveBeenCalled()
  expect(screen.getByRole('dialog', { name: copy.confirmLapseDelete.title })).toBeVisible()

  await userEvent.click(screen.getByRole('button', { name: copy.confirmLapseDelete.cancel }))
  expect(onDelete).not.toHaveBeenCalled()

  await userEvent.click(screen.getByRole('button', { name: copy.delete }))
  await userEvent.click(screen.getByRole('button', { name: copy.confirmLapseDelete.confirm }))
  expect(onDelete).toHaveBeenCalledOnce()
})
