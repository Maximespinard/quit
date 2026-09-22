import { render, screen } from '@testing-library/react'
import { LevelBar } from './LevelBar'

it('exposes the XP figures as a progressbar', () => {
  render(<LevelBar label="XP du niveau 4" xpIntoLevel={620} xpForLevel={1000} />)

  const bar = screen.getByRole('progressbar', { name: 'XP du niveau 4' })
  expect(bar).toHaveAttribute('aria-valuenow', '620')
  expect(bar).toHaveAttribute('aria-valuemax', '1000')
  expect(bar.firstElementChild).toHaveStyle({ width: '62%' })
})

it('never overflows past the level', () => {
  render(<LevelBar label="XP" xpIntoLevel={1500} xpForLevel={1000} />)

  expect(screen.getByRole('progressbar').firstElementChild).toHaveStyle({ width: '100%' })
})
