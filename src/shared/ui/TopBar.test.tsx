import { render, screen } from '@testing-library/react'
import { TopBar } from './TopBar'

it('names the screen with the brand and shows the context across from it', () => {
  render(<TopBar brand="quit">Étape 2 · 14 mg</TopBar>)

  expect(screen.getByRole('heading', { level: 1, name: 'quit' })).toBeInTheDocument()
  expect(screen.getByText('Étape 2 · 14 mg')).toBeInTheDocument()
})

it('sets an action after the context', () => {
  render(<TopBar action={<button type="button">Réglages</button>}>Étape 2 · 14 mg</TopBar>)

  expect(screen.getByRole('heading', { level: 1, name: 'quit' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Réglages' })).toBeInTheDocument()
})
