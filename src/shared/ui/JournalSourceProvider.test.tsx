import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { recordCraving } from '@/shared/domain/facts/craving'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { factId } from '@/shared/utils/fact-id'
import { JournalSourceProvider } from './JournalSourceProvider'

const NOW = Date.UTC(2026, 8, 1, 8)

/** Records a craving in whatever journal the source holds, and says what it holds. */
function RecordCraving() {
  const { state, commit, mirror } = useJournalSource()
  if (state.status !== 'ready') return null
  const record = () => {
    const recorded = recordCraving(
      state.journal,
      { id: factId(1), at: NOW, intensity: 2, heldToEnd: false, tags: [] },
      NOW,
    )
    if (recorded.ok) void commit(recorded.journal)
  }
  return (
    <>
      <button type="button" onClick={record}>
        record
      </button>
      <p>{`${state.journal.facts.length} facts, mirror ${mirror === null ? 'none' : mirror.state}`}</p>
    </>
  )
}

describe('the sandbox', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('has no mirror, and a fact recorded in it never leaves the device', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    render(
      <JournalSourceProvider source={{ kind: 'sandbox', clockAt: NOW, scenario: null }}>
        <RecordCraving />
      </JournalSourceProvider>,
    )

    await userEvent.click(await screen.findByRole('button', { name: 'record' }))

    await waitFor(() => expect(screen.getByText('1 facts, mirror none')).toBeInTheDocument())
    expect(fetch).not.toHaveBeenCalled()
  })
})
