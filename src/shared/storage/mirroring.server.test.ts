// @vitest-environment node
import { type Mirror, mirrorSchema } from '@quit/contract/mirror'
import { closeTestApis, openTestApi, type TestApi } from 'quit-server/src/test/test-api.ts'
import { recordCraving } from '@/shared/domain/facts/craving'
import { recordQuitMoment } from '@/shared/domain/facts/quit-moment'
import { emptyJournal, type Journal, removeFact } from '@/shared/domain/journal'
import { exportJournal, importJournal } from '@/shared/domain/journal-file'
import { setWeeklySpend } from '@/shared/domain/journal-settings'
import type { MirrorLink } from '@/shared/domain/mirror-link'
import type { PendingChange } from '@/shared/domain/pending-changes'
import { factIdSequence } from '@/shared/test/fact-ids'
import { factId } from '@/shared/utils/fact-id'
import { createMemoryJournalStore, createMemoryStore } from './memory-journal-store'
import { createMirroring } from './mirroring'

/**
 * The mirrored journal store driven as the app drives it, against the real server started in
 * the test: what the mirror ends up holding is read back through the API. The device's stores
 * are in memory; a new `createMirroring` over them is the app reloaded.
 */

const QUIT_AT = Date.UTC(2026, 8, 1, 8)
const NOW = QUIT_AT + 3 * 86_400_000

afterEach(closeTestApis)

/** Unwraps a domain result the test knows is accepted. */
function accepted(result: { ok: true; journal: Journal } | { ok: false }): Journal {
  if (!result.ok) throw new Error('refused')
  return result.journal
}

const quitJournal = accepted(recordQuitMoment(emptyJournal, QUIT_AT, NOW, factIdSequence()))

const withCraving = (journal: Journal, n: number, intensity: 1 | 2 | 3 = 2) =>
  accepted(
    recordCraving(
      journal,
      { id: factId(n), at: QUIT_AT + n * 60_000, intensity, heldToEnd: true, tags: [] },
      NOW,
    ),
  )

async function openDevice({ linked = true }: { linked?: boolean } = {}) {
  const api: TestApi = await openTestApi()
  const key = api.issueKey()
  const device = {
    journal: createMemoryJournalStore(quitJournal),
    pending: createMemoryStore<readonly PendingChange[]>([]),
    link: createMemoryStore<MirrorLink | null>(linked ? { deviceKey: key, revoked: false } : null),
  }
  /** Every request the device made, as `METHOD /path`. */
  const requests: string[] = []
  /** The app on this device, (re)loaded. */
  const launch = () =>
    createMirroring({
      ...device,
      apiBase: api.url,
      retryDelayMs: () => 20,
      fetch: (input, init) => {
        requests.push(`${init?.method ?? 'GET'} ${new URL(String(input)).pathname}`)
        return fetch(input, init)
      },
    })
  async function mirror(): Promise<Mirror> {
    const response = await api.request('GET', '/api/mirror', { key })
    return mirrorSchema.parse(await response.json())
  }
  return { api, key, device, requests, launch, mirror }
}

describe('every change reaches the mirror', () => {
  it('sends a fact recorded after the link', async () => {
    const { launch, mirror } = await openDevice()
    const app = launch()
    const journal = await app.journal.load()

    await app.journal.save(withCraving(journal, 2))
    await app.send()

    expect((await mirror()).facts).toEqual([withCraving(emptyJournal, 2).facts[0]])
  })

  it('replaces a corrected fact under its id, and removes a deleted one', async () => {
    const { launch, mirror } = await openDevice()
    const app = launch()
    const recorded = withCraving(withCraving(await app.journal.load(), 2), 3)
    await app.journal.save(recorded)
    await app.send()

    const corrected = withCraving(removeFact(recorded, factId(2)), 2, 3)
    await app.journal.save(removeFact(corrected, factId(3)))
    await app.send()

    expect((await mirror()).facts).toEqual([
      expect.objectContaining({ id: factId(2), intensity: 3 }),
    ])
  })

  it('sends the whole settings once one changes', async () => {
    const { launch, mirror } = await openDevice()
    const app = launch()
    const journal = await app.journal.load()

    await app.journal.save(accepted(setWeeklySpend(journal, 8_400)))
    await app.send()

    expect((await mirror()).settings).toEqual({
      protocol: journal.protocol,
      weeklySpendCents: 8_400,
      baselineSmokesPerDay: null,
      goal: null,
    })
  })

  it('makes the mirror follow an imported journal', async () => {
    const { launch, mirror } = await openDevice()
    const app = launch()
    await app.journal.save(withCraving(await app.journal.load(), 2))
    await app.send()
    const file = exportJournal(
      { ...withCraving(quitJournal, 3), baselineSmokesPerDay: 20 },
      NOW,
      'device',
    )

    await app.journal.save(accepted(importJournal(file, 'device', factIdSequence())))
    await app.send()

    const held = await mirror()
    expect(held.facts.map((fact) => fact.id)).toEqual([factId(3)])
    expect(held.settings?.baselineSmokesPerDay).toBe(20)
  })

  it('resumes after a stop, even when the send joins the run the stop cut short', async () => {
    const { launch, mirror } = await openDevice()
    const app = launch()
    await app.journal.save(withCraving(await app.journal.load(), 2))
    await app.journal.save(withCraving(await app.journal.load(), 3))

    app.stop()
    await app.send()

    expect((await mirror()).facts.map((fact) => fact.id)).toEqual([factId(2), factId(3)])
  })

  it('never sends an unlinked journal, nor keeps its changes for later', async () => {
    const { launch, device, requests } = await openDevice({ linked: false })
    const app = launch()

    await app.journal.save(withCraving(await app.journal.load(), 2))
    await app.send()

    expect(requests).toEqual([])
    expect(await device.pending.load()).toEqual([])
  })
})

describe('with the server unreachable', () => {
  it('keeps the changes on the device, across a reload, until the server can be reached', async () => {
    const { api, launch, device, mirror } = await openDevice()
    const offline = launch()
    await api.stop()

    await offline.journal.save(withCraving(await offline.journal.load(), 2))
    await offline.journal.save(withCraving(await offline.journal.load(), 3))
    await offline.send()
    offline.stop()
    expect(await device.pending.load()).toHaveLength(2)

    await api.resume()
    const reloaded = launch()
    await reloaded.send()

    expect((await mirror()).facts.map((fact) => fact.id)).toEqual([factId(2), factId(3)])
    expect(await device.pending.load()).toEqual([])
  })

  it('retries by itself once the server is back', async () => {
    const { api, launch, mirror } = await openDevice()
    const app = launch()
    await api.stop()
    await app.journal.save(withCraving(await app.journal.load(), 2))
    await app.send()

    await api.resume()

    await vi.waitFor(async () => expect((await mirror()).facts).toHaveLength(1))
    app.stop()
  })

  it('sends only the latest version of a fact changed several times meanwhile', async () => {
    const { api, launch, requests, mirror } = await openDevice()
    const app = launch()
    await api.stop()
    const recorded = withCraving(await app.journal.load(), 2, 1)
    await app.journal.save(recorded)
    await app.journal.save(withCraving(removeFact(recorded, factId(2)), 2, 2))
    await app.journal.save(withCraving(removeFact(recorded, factId(2)), 2, 3))
    await app.send()
    app.stop()
    requests.length = 0

    await api.resume()
    await launch().send()

    expect(requests).toEqual([`PUT /api/facts/${factId(2)}`])
    expect((await mirror()).facts).toEqual([
      expect.objectContaining({ id: factId(2), intensity: 3 }),
    ])
  })
})

describe('a revoked device key', () => {
  it('marks the link revoked and keeps the pending changes, until a new key is pasted', async () => {
    const { api, launch, device, requests } = await openDevice()
    const app = launch()
    const newKey = api.issueKey()

    await app.journal.save(withCraving(await app.journal.load(), 2))
    await app.send()

    expect(await app.loadLink()).toEqual(expect.objectContaining({ revoked: true }))
    expect(await device.pending.load()).toHaveLength(1)

    requests.length = 0
    await app.send()
    expect(requests).toEqual([])

    await app.link(newKey)
    await app.send()
    expect(await app.loadLink()).toEqual({ deviceKey: newKey, revoked: false })
    expect(await device.pending.load()).toEqual([])
    const response = await api.request('GET', '/api/mirror', { key: newKey })
    expect(mirrorSchema.parse(await response.json()).facts).toHaveLength(1)
  })
})
