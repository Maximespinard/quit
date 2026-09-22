import { render, screen } from '@testing-library/react'
import { StreakHero } from './StreakHero'

beforeAll(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
})

it('reads the full day count and pads the clock', () => {
  render(
    <StreakHero
      days={12}
      hours={7}
      minutes={4}
      daysLabel="jours sans fumer"
      brand="quit"
      context="Étape 1 · 21 mg"
    />,
  )

  expect(screen.getByRole('region', { name: 'jours sans fumer' })).toHaveTextContent('12')
  expect(screen.getByText('07 h 04')).toBeInTheDocument()
})
