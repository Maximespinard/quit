import { latestQuitMoment } from '@/shared/domain/facts/quit-moment'
import { emptyJournal, type Journal } from '@/shared/domain/journal'
import { factIdSequence } from '@/shared/test/fact-ids'
import { factId } from '@/shared/utils/fact-id'
import { isChanged, saveSettings, settingsInForce } from './settings-form'

// Seconds on purpose: the field only shows minutes, an untouched moment must keep them.
const QUIT = new Date(2026, 0, 10, 8, 0, 30).getTime()
const CRAVING = new Date(2026, 0, 12, 18, 0).getTime()
const NOW = new Date(2026, 0, 20, 12, 0).getTime()

const journal: Journal = {
  ...emptyJournal,
  facts: [
    { type: 'quit-moment', id: factId(1), at: QUIT },
    { type: 'craving', id: factId(2), at: CRAVING, intensity: 2, heldToEnd: false, tags: [] },
  ],
  weeklySpendCents: 3500,
  baselineSmokesPerDay: 15,
}

const inForce = settingsInForce(journal, NOW)

describe('settingsInForce', () => {
  it('shows each setting as its field holds it', () => {
    expect(inForce).toEqual({ quitMoment: '2026-01-10T08:00', spend: '35', baseline: '15' })
  })

  it('leaves an unset value empty', () => {
    const unset = { ...journal, weeklySpendCents: null, baselineSmokesPerDay: null }
    expect(settingsInForce(unset, NOW)).toMatchObject({
      spend: '',
      baseline: '',
    })
  })
})

describe('isChanged', () => {
  it('is false while every field holds what is in force', () => {
    expect(isChanged(inForce, { ...inForce })).toBe(false)
  })

  it('is true as soon as one field differs', () => {
    expect(isChanged(inForce, { ...inForce, baseline: '20' })).toBe(true)
  })
})

describe('saveSettings', () => {
  const save = (fields: Partial<typeof inForce>) =>
    saveSettings(journal, inForce, { ...inForce, ...fields }, NOW, factIdSequence(90))

  it('applies every changed setting in one journal', () => {
    const result = save({ quitMoment: '2026-01-05T09:00', spend: '48,90', baseline: '20' })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(latestQuitMoment(result.journal)).toBe(new Date(2026, 0, 5, 9, 0).getTime())
    expect(result.journal.weeklySpendCents).toBe(4890)
    expect(result.journal.baselineSmokesPerDay).toBe(20)
  })

  it('records no quit moment when its field is untouched', () => {
    const result = save({ spend: '40' })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.journal.facts).toEqual(journal.facts)
    expect(latestQuitMoment(result.journal)).toBe(QUIT)
  })

  it('refuses every invalid field at once and saves nothing', () => {
    const result = save({ quitMoment: '2026-01-15T09:00', spend: '-5', baseline: 'beaucoup' })

    expect(result).toEqual({
      ok: false,
      refusals: {
        quitMoment: { reason: 'after-facts', earliestFact: CRAVING },
        spend: true,
        baseline: true,
      },
    })
  })

  it('refuses a quit moment in the future, or one the field cannot read', () => {
    expect(save({ quitMoment: '2026-01-21T09:00' })).toEqual({
      ok: false,
      refusals: { quitMoment: { reason: 'future' } },
    })
    expect(save({ quitMoment: '' })).toEqual({
      ok: false,
      refusals: { quitMoment: { reason: 'invalid' } },
    })
  })

  it('names only the refused field when the others are valid', () => {
    expect(save({ spend: '40', baseline: '0' })).toEqual({
      ok: false,
      refusals: { baseline: true },
    })
  })
})
