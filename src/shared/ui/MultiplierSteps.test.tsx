import { render, screen } from '@testing-library/react'
import { MultiplierSteps } from './MultiplierSteps'

it('marks acquired, current and locked steps', () => {
  render(<MultiplierSteps steps={[1, 2, 3, 4, 5]} current={3} label="Multiplicateur" />)

  const items = screen.getAllByRole('listitem')
  expect(items.map((item) => item.dataset.state)).toEqual([
    'acquired',
    'acquired',
    'current',
    'locked',
    'locked',
  ])
  expect(screen.getByText('×3')).toHaveAttribute('aria-current', 'step')
})
