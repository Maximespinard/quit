import { emptyJournal, type Journal } from '@/shared/domain/journal'
import { factId } from '@/shared/utils/fact-id'
import { customTags, resolveTypedTag } from './craving-tags'

const HOUR = 3_600_000
const NOW = Date.UTC(2026, 8, 22, 10, 0, 0)

const withCravings = (...cravings: { at: number; tags: string[] }[]): Journal => ({
  ...emptyJournal,
  facts: cravings.map(({ at, tags }, i) => ({
    type: 'craving' as const,
    id: factId(i + 1),
    at,
    intensity: 2,
    heldToEnd: false,
    tags,
  })),
})

describe('customTags', () => {
  it('offers no custom tag before any was typed', () => {
    expect(customTags(emptyJournal)).toEqual([])
    expect(customTags(withCravings({ at: NOW, tags: ['coffee', 'stress'] }))).toEqual([])
  })

  it('offers every tag the user typed, the most recently used first', () => {
    const journal = withCravings(
      { at: NOW - 3 * HOUR, tags: ['Yoga', 'coffee'] },
      { at: NOW - HOUR, tags: ['Jeu vidéo'] },
      // Backdated after the others were recorded: it still ranks by when it happened.
      { at: NOW - 5 * HOUR, tags: ['Voiture'] },
    )

    expect(customTags(journal)).toEqual(['Jeu vidéo', 'Yoga', 'Voiture'])
  })

  it('offers a tag once, spelled as last used, however often and however it was cased', () => {
    const journal = withCravings(
      { at: NOW - 2 * HOUR, tags: ['yoga'] },
      { at: NOW - HOUR, tags: ['Yoga'] },
    )

    expect(customTags(journal)).toEqual(['Yoga'])
  })

  it('never offers a default tag as a custom one, whatever its case', () => {
    expect(customTags(withCravings({ at: NOW, tags: ['Coffee', 'YOUTUBE'] }))).toEqual([])
  })
})

describe('resolveTypedTag', () => {
  const offered = [
    { tag: 'coffee', label: 'Café' },
    { tag: 'youtube', label: 'YouTube' },
    { tag: 'Jeu vidéo', label: 'Jeu vidéo' },
  ]

  it('keeps a new tag as typed, its spacing cleaned', () => {
    expect(resolveTypedTag('  Balade   en ville ', offered)).toBe('Balade en ville')
  })

  it('merges a typed tag into the offered one differing only by case or spacing', () => {
    expect(resolveTypedTag(' youtube', offered)).toBe('youtube')
    expect(resolveTypedTag('CAFÉ', offered)).toBe('coffee')
    expect(resolveTypedTag('jeu  vidéo', offered)).toBe('Jeu vidéo')
  })

  it('resolves nothing from a blank entry', () => {
    expect(resolveTypedTag('   ', offered)).toBeNull()
  })
})
