import '@testing-library/jest-dom/vitest'
import { stubMatchMedia } from './motion'

// jsdom has no matchMedia. Tests run as reduced motion: animated figures show their target at once.
// Tests against the real server run in Node, without a window.
if (typeof window !== 'undefined') stubMatchMedia(true)
