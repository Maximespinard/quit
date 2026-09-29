import { vi } from 'vitest'

/** Tests run as reduced motion (`src/test/setup.ts`); this one lets motion play. */
export function withMotion() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}
