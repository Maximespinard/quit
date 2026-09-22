import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TabBar } from './TabBar'

const items = [
  { id: 'home', label: 'Accueil', icon: null },
  { id: 'calendar', label: 'Calendrier', icon: null },
] as const

it('marks the active tab and reports a selection', async () => {
  const onSelect = vi.fn()
  render(<TabBar label="Navigation" items={items} activeId="home" onSelect={onSelect} />)

  expect(screen.getByRole('button', { name: 'Accueil' })).toHaveAttribute('aria-current', 'page')

  await userEvent.click(screen.getByRole('button', { name: 'Calendrier' }))
  expect(onSelect).toHaveBeenCalledWith('calendar')
})
