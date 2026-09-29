import { render, screen } from '@testing-library/react'
import { TopBar } from './TopBar'

it('names the screen with the brand and shows the context across from it', () => {
  render(<TopBar brand="quit">Étape 2 · 14 mg</TopBar>)

  expect(screen.getByRole('heading', { level: 1, name: 'quit' })).toBeInTheDocument()
  expect(screen.getByText('Étape 2 · 14 mg')).toBeInTheDocument()
})
