import { render, screen } from '@testing-library/react'
import { PageHeader } from './PageHeader'

it('titles the screen beside its way back, the lead under them', () => {
  render(
    <PageHeader
      title="Historique"
      lead="Du plus récent au plus ancien."
      back={<a href="/" aria-label="Retour" />}
    />,
  )

  expect(screen.getByRole('heading', { name: 'Historique' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Retour' })).toBeInTheDocument()
  expect(screen.getByText('Du plus récent au plus ancien.')).toBeInTheDocument()
})
