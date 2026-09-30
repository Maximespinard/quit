import { vi } from 'vitest'

/** Stubs jsdom's missing `matchMedia`: `reduce` answers the reduced-motion query. */
export function stubMatchMedia(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

/** Tests run as reduced motion (`setup.ts`); this one lets motion play. */
export const withMotion = () => stubMatchMedia(false)
