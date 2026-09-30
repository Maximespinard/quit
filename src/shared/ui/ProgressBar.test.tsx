import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

it('exposes the figures as a progressbar', () => {
  render(<ProgressBar label="XP du niveau 4" value={620} max={1000} />)

  const bar = screen.getByRole('progressbar', { name: 'XP du niveau 4' })
  expect(bar).toHaveAttribute('aria-valuenow', '620')
  expect(bar).toHaveAttribute('aria-valuemax', '1000')
  expect(bar.firstElementChild).toHaveStyle({ width: '62%' })
})

it('never overflows past its end', () => {
  render(<ProgressBar label="XP" value={1500} max={1000} />)

  const bar = screen.getByRole('progressbar')
  expect(bar).toHaveAttribute('aria-valuenow', '1000')
  expect(bar.firstElementChild).toHaveStyle({ width: '100%' })
})

it('reads a value text in place of the raw figure', () => {
  render(
    <ProgressBar label="Économies" value={22_008} max={40_000} valueText="220,08 € sur 400 €" />,
  )

  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '220,08 € sur 400 €')
})

it('fills with Braise laid over the whole track', () => {
  render(<ProgressBar label="XP" value={100} max={1000} />)

  const fill = screen.getByRole('progressbar').firstElementChild
  expect(fill).toHaveClass('bg-chart-bar', 'bg-[length:100cqw_100%]')
  expect(fill).not.toHaveClass('bg-ink')
})
