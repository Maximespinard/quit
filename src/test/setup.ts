import '@testing-library/jest-dom/vitest'

// jsdom has no matchMedia. Tests run as reduced motion: animated figures show their target at once.
window.matchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: query.includes('reduce'),
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}))
