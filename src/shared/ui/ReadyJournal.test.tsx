import { render, screen } from '@testing-library/react'
import { emptyJournal } from '@/shared/domain/journal'
import type { JournalState } from '@/shared/hooks/useJournal'
import { strings } from '@/shared/utils/strings'
import { ReadyJournal } from './ReadyJournal'

const header = <h2>Réglages</h2>
const ready: JournalState = { status: 'ready', journal: emptyJournal }

describe('ReadyJournal, with a header', () => {
  it('keeps the header while the journal loads', () => {
    render(
      <ReadyJournal state={{ status: 'loading' }} header={header}>
        {() => 'Contenu'}
      </ReadyJournal>,
    )

    expect(screen.getByRole('heading', { name: 'Réglages' })).toBeInTheDocument()
    expect(screen.getByText(strings.journal.loading)).toBeInTheDocument()
  })

  it('keeps the header when the journal cannot be read', () => {
    render(
      <ReadyJournal state={{ status: 'error' }} header={header}>
        {() => 'Contenu'}
      </ReadyJournal>,
    )

    expect(screen.getByRole('heading', { name: 'Réglages' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(strings.journal.error)
  })

  it('renders the content under the header, in the shell', () => {
    render(
      <ReadyJournal state={ready} header={header}>
        {() => 'Contenu'}
      </ReadyJournal>,
    )

    expect(screen.getByRole('heading', { name: strings.app.name })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Réglages' })).toBeInTheDocument()
    expect(screen.getByText('Contenu')).toBeInTheDocument()
  })
})

it('without a header, leaves the shell to the content', () => {
  render(<ReadyJournal state={ready}>{() => 'Contenu'}</ReadyJournal>)

  expect(screen.queryByRole('heading', { name: strings.app.name })).not.toBeInTheDocument()
  expect(screen.getByText('Contenu')).toBeInTheDocument()
})
