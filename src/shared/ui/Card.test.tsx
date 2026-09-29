import { render, screen } from '@testing-library/react'
import { Card } from './Card'

it('names its region with its title, at the heading level asked', () => {
  render(
    <Card title="Protocole" headingLevel={3} aside="Étape 2 / 3">
      Jour 17 sur 28
    </Card>,
  )

  const region = screen.getByRole('region', { name: 'Protocole' })
  expect(screen.getByRole('heading', { level: 3, name: 'Protocole' })).toBeInTheDocument()
  expect(region).toHaveTextContent('Étape 2 / 3')
  expect(region).toHaveTextContent('Jour 17 sur 28')
})

it('takes an accessible name without a visible title', () => {
  render(<Card label="Sauvegarde">Exporte ton journal.</Card>)

  expect(screen.getByRole('region', { name: 'Sauvegarde' })).toHaveTextContent(
    'Exporte ton journal.',
  )
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()
})

it('is a plain surface when it has no name', () => {
  render(<Card padding="rows">Une ligne</Card>)

  expect(screen.queryByRole('region')).not.toBeInTheDocument()
  expect(screen.getByText('Une ligne')).toBeInTheDocument()
})
