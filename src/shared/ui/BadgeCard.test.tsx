import { render, screen } from '@testing-library/react'
import { BadgeCard } from './BadgeCard'

it('names a locked badge as locked for assistive tech', () => {
  render(<BadgeCard name="Palier 14 mg" detail="J+28" unlocked={false} lockedLabel="à débloquer" />)

  expect(screen.getByText('Palier 14 mg')).toHaveTextContent('à débloquer')
})

it('does not mark an earned badge', () => {
  render(<BadgeCard name="24 heures" detail="J+1" unlocked lockedLabel="à débloquer" />)

  expect(screen.getByText('24 heures')).not.toHaveTextContent('à débloquer')
})
