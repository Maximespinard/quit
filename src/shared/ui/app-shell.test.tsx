import { render, screen } from '@testing-library/react'
import { AppShell } from './app-shell'

it('renders its children inside the shell', () => {
  render(<AppShell>Hello</AppShell>)

  expect(screen.getByRole('heading', { name: 'Quit' })).toBeInTheDocument()
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
