import { checkForUpdateOnReturn } from './service-worker'

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: state })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('checkForUpdateOnReturn', () => {
  afterEach(() => setVisibility('visible'))

  it('checks for a new build each time the app comes back to the foreground', () => {
    const update = vi.fn(() => Promise.resolve())
    checkForUpdateOnReturn({ update }, document)

    setVisibility('hidden')
    setVisibility('visible')
    setVisibility('hidden')
    setVisibility('visible')

    expect(update).toHaveBeenCalledTimes(2)
  })

  it('does not check while the app goes to the background', () => {
    const update = vi.fn(() => Promise.resolve())
    checkForUpdateOnReturn({ update }, document)

    setVisibility('hidden')

    expect(update).not.toHaveBeenCalled()
  })

  // Vitest fails the run on an unhandled rejection: passing proves the failure is swallowed.
  it('stays quiet when the check fails offline', async () => {
    const update = vi.fn(() => Promise.reject(new TypeError('Failed to fetch')))
    checkForUpdateOnReturn({ update }, document)

    setVisibility('visible')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(update).toHaveBeenCalledOnce()
  })
})
