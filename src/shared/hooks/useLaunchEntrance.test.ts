import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ENTRANCE_MS, useLaunchEntrance } from './useLaunchEntrance'

/** The played entrances outlive a render by design: each test takes its own key. */
let keyCount = 0
const freshKey = () => `test-entrance-${++keyCount}`

const withMotion = () => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

describe('useLaunchEntrance', () => {
  const reducedMotion = window.matchMedia

  beforeEach(() => {
    vi.useFakeTimers()
    withMotion()
  })

  afterEach(() => {
    window.matchMedia = reducedMotion
    vi.useRealTimers()
  })

  it('plays from 0 to 1 on the first mount of the launch', () => {
    const { result } = renderHook(() => useLaunchEntrance(freshKey()))
    expect(result.current).toBe(0)

    act(() => vi.advanceTimersByTime(ENTRANCE_MS / 2))
    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(1)

    act(() => vi.advanceTimersByTime(ENTRANCE_MS))
    expect(result.current).toBe(1)
  })

  it('does not play again on a later mount of the same key', () => {
    const key = freshKey()
    const first = renderHook(() => useLaunchEntrance(key))
    act(() => vi.advanceTimersByTime(ENTRANCE_MS))
    first.unmount()

    const second = renderHook(() => useLaunchEntrance(key))
    expect(second.result.current).toBe(1)
  })

  it('counts as played once started, even if left before it lands', () => {
    const key = freshKey()
    renderHook(() => useLaunchEntrance(key)).unmount()

    expect(renderHook(() => useLaunchEntrance(key)).result.current).toBe(1)
  })

  it('never restarts on a re-render once played', () => {
    const { result, rerender } = renderHook(() => useLaunchEntrance(freshKey()))
    act(() => vi.advanceTimersByTime(ENTRANCE_MS))

    rerender()
    expect(result.current).toBe(1)
  })

  it('keeps each key to its own launch entrance', () => {
    const played = freshKey()
    renderHook(() => useLaunchEntrance(played))

    expect(renderHook(() => useLaunchEntrance(freshKey())).result.current).toBe(0)
  })

  it('is at 1 from the first paint under reduced motion', () => {
    window.matchMedia = reducedMotion
    const { result } = renderHook(() => useLaunchEntrance(freshKey()))
    expect(result.current).toBe(1)
  })
})
