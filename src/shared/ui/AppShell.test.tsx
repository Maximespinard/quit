import { render, screen } from '@testing-library/react'
import { strings } from '@/shared/utils/strings'
import { AppShell } from './AppShell'

it('renders its children inside the shell', () => {
  render(<AppShell>Hello</AppShell>)

  expect(screen.getByRole('heading', { name: strings.app.name })).toBeInTheDocument()
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
