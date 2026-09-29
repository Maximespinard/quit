import '@testing-library/jest-dom/vitest'

// jsdom has no matchMedia. Tests run as reduced motion: animated figures show their target at once.
// Tests against the real server run in Node, without a window.
if (typeof window !== 'undefined') {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}
