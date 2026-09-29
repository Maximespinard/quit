import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AUTH_FAILURES_PER_WINDOW, MAX_BODY_BYTES } from './app.ts'
import { expectProblem, onCleanup, setup } from './test-api.ts'

describe('health', () => {
  it('answers 200 without a device key while the database is reachable', async () => {
    const api = await setup()

    const response = await api.request('GET', '/api/health')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok' })
  })

  it('answers 503 once the database is unreachable', async () => {
    const api = await setup()

    api.database.close()
    const response = await api.request('GET', '/api/health')

    await expectProblem(response, 503)
  })
})

describe('device key', () => {
  it('lets a request with the active key through', async () => {
    const api = await setup()
    const key = api.issueKey()

    const response = await api.request('GET', '/api/nothing-here', { key })

    await expectProblem(response, 404)
  })

  it.each([
    ['no key', { key: null }],
    ['a wrong key', { key: 'not-the-device-key-not-the-device-key-000' }],
    ['another scheme', { authorization: 'Basic dXNlcjpwYXNz' }],
    ['an empty bearer', { authorization: 'Bearer ' }],
  ])('answers 401 to a request with %s', async (_, options) => {
    const api = await setup()
    api.issueKey()

    const response = await api.request('GET', '/api/nothing-here', options)

    await expectProblem(response, 401)
    expect(response.headers.get('www-authenticate')).toBe('Bearer')
  })

  it('answers 401 while no key was ever issued', async () => {
    const api = await setup()

    const response = await api.request('GET', '/api/nothing-here', {
      key: 'not-the-device-key-not-the-device-key-000',
    })

    await expectProblem(response, 401)
  })

  it('revokes the previous key when a new one is issued', async () => {
    const api = await setup()
    const first = api.issueKey()
    const second = api.issueKey()

    const revoked = await api.request('GET', '/api/nothing-here', { key: first })
    const active = await api.request('GET', '/api/nothing-here', { key: second })

    expect(second).not.toBe(first)
    await expectProblem(revoked, 401)
    await expectProblem(active, 404)
  })

  it('checks the key before the route: an unknown API route without a key answers 401', async () => {
    const api = await setup()

    const response = await api.request('POST', '/api/anywhere', { body: '{}' })

    await expectProblem(response, 401)
  })
})

describe('errors', () => {
  it('answers 404 outside the API while no app is served', async () => {
    const api = await setup()

    await expectProblem(await api.request('GET', '/history'), 404)
  })

  it('answers 400 to malformed JSON', async () => {
    const api = await setup()
    const key = api.issueKey()

    const response = await api.request('PUT', '/api/nothing-here', { key, body: '{"at": 1' })

    await expectProblem(response, 400)
  })

  it('answers 413 to a body over the size limit', async () => {
    const api = await setup()
    const key = api.issueKey()
    const body = JSON.stringify({ padding: 'x'.repeat(MAX_BODY_BYTES) })

    const response = await api.request('PUT', '/api/nothing-here', { key, body })

    await expectProblem(response, 413)
  })

  it('answers 404 to an unknown route', async () => {
    const api = await setup()
    const key = api.issueKey()

    const response = await api.request('PUT', '/api/nothing-here', { key, body: '{}' })

    await expectProblem(response, 404)
  })
})

describe('rate limit', () => {
  it('refuses every request with 429 once failed attempts reach the limit', async () => {
    const api = await setup()
    const key = api.issueKey()
    const wrong = 'not-the-device-key-not-the-device-key-000'

    for (let attempt = 0; attempt < AUTH_FAILURES_PER_WINDOW; attempt++) {
      await expectProblem(await api.request('GET', '/api/nothing-here', { key: wrong }), 401)
    }
    const guessed = await api.request('GET', '/api/nothing-here', { key })

    await expectProblem(guessed, 429)
  })

  it('does not count requests with the right key', async () => {
    const api = await setup()
    const key = api.issueKey()

    for (let attempt = 0; attempt < AUTH_FAILURES_PER_WINDOW; attempt++) {
      await api.request('GET', '/api/nothing-here', { key })
    }
    const response = await api.request('GET', '/api/nothing-here', { key })

    await expectProblem(response, 404)
  })

  it('counts per client behind a proxy: one client failing does not lock out another', async () => {
    const api = await setup({ trustProxyHops: 1 })
    const key = api.issueKey()
    const wrong = 'not-the-device-key-not-the-device-key-000'

    for (let attempt = 0; attempt < AUTH_FAILURES_PER_WINDOW; attempt++) {
      await api.request('GET', '/api/nothing-here', { key: wrong, forwardedFor: '203.0.113.7' })
    }
    const attacker = await api.request('GET', '/api/nothing-here', {
      key,
      forwardedFor: '203.0.113.7',
    })
    const owner = await api.request('GET', '/api/nothing-here', {
      key,
      forwardedFor: '198.51.100.20',
    })

    await expectProblem(attacker, 429)
    await expectProblem(owner, 404)
  })

  it('keeps the health check out of it', async () => {
    const api = await setup()

    for (let attempt = 0; attempt < AUTH_FAILURES_PER_WINDOW; attempt++) {
      await api.request('GET', '/api/nothing-here')
    }
    const response = await api.request('GET', '/api/health')

    expect(response.status).toBe(200)
  })
})

describe('logs', () => {
  it('log each request with an id, never its body, its query nor the device key', async () => {
    const api = await setup()
    const key = api.issueKey()
    const secret = 'craving-note-that-must-stay-private'

    const accepted = await api.request('PUT', '/api/nothing-here', {
      key,
      body: JSON.stringify({ note: secret }),
    })
    await api.request('PUT', '/api/nothing-here', { key, body: `{"note": "${secret}"` })
    await api.request('PUT', '/api/nothing-here', { key: `${key}-${secret}`, body: '{}' })
    await api.request('GET', `/api/nothing-here?note=${secret}`, { key })

    const lines = api.logs.map((line) => JSON.parse(line))
    const requestId = accepted.headers.get('x-request-id')
    expect(requestId).toBeTruthy()
    expect(lines).toContainEqual(
      expect.objectContaining({
        req: { id: requestId, method: 'PUT', path: '/api/nothing-here' },
        res: { statusCode: 404 },
      }),
    )
    expect(lines).toHaveLength(4)
    expect(api.logs.join('\n')).not.toContain(secret)
    expect(api.logs.join('\n')).not.toContain(key)
  })
})

const INDEX_HTML = '<!doctype html><title>Quit</title>'
const HASHED_ASSET = '/assets/index-D5vVQmWf.js'

/**
 * A built app as `vite build` lays it out: the shell, the service worker, hashed assets. Its
 * directory starts with a dot, as a worktree under `.claude/` does: the dotfile rule applies to
 * the paths served, never to where the build lives.
 */
async function builtApp() {
  const dir = await mkdtemp(join(tmpdir(), '.quit-app-'))
  onCleanup(() => rm(dir, { recursive: true, force: true }))
  await mkdir(join(dir, 'assets'))
  await writeFile(join(dir, 'index.html'), INDEX_HTML)
  await writeFile(join(dir, 'sw.js'), 'self.skipWaiting()')
  await writeFile(join(dir, 'manifest.webmanifest'), '{"name":"Quit"}')
  await writeFile(join(dir, HASHED_ASSET), 'export {}')
  return dir
}

const REVALIDATED = 'no-cache'

describe('the app', () => {
  it('serves a hashed asset cached for a year, as immutable', async () => {
    const api = await setup({ appDir: await builtApp() })

    const response = await api.request('GET', HASHED_ASSET)

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('export {}')
    expect(response.headers.get('cache-control')).toBe('public, max-age=31536000, immutable')
  })

  it.each(['/', '/index.html'])('serves the shell at %s, never cached', async (path) => {
    const api = await setup({ appDir: await builtApp() })

    const response = await api.request('GET', path)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/html')
    expect(await response.text()).toBe(INDEX_HTML)
    expect(response.headers.get('cache-control')).toBe(REVALIDATED)
  })

  it('serves the service worker and the manifest, never cached', async () => {
    const api = await setup({ appDir: await builtApp() })

    const worker = await api.request('GET', '/sw.js')
    const manifest = await api.request('GET', '/manifest.webmanifest')

    expect(worker.status).toBe(200)
    expect(worker.headers.get('content-type')).toContain('javascript')
    expect(worker.headers.get('cache-control')).toBe(REVALIDATED)
    expect(manifest.status).toBe(200)
    expect(manifest.headers.get('cache-control')).toBe(REVALIDATED)
  })

  it('serves the shell for a deep link, which the router then resolves', async () => {
    const api = await setup({ appDir: await builtApp() })

    const response = await api.request('GET', '/history/019a1b2c-3d4e-7f60-8a9b-0c1d2e3f4a5b')

    expect(response.status).toBe(200)
    expect(await response.text()).toBe(INDEX_HTML)
    expect(response.headers.get('cache-control')).toBe(REVALIDATED)
  })

  it('answers 404 to a missing file rather than the shell', async () => {
    const api = await setup({ appDir: await builtApp() })

    await expectProblem(await api.request('GET', '/assets/index-0ld0ld.js'), 404)
    await expectProblem(await api.request('GET', '/assets/chunk'), 404)
    await expectProblem(await api.request('POST', '/history'), 404)
  })

  it('keeps the API behind the device key', async () => {
    const api = await setup({ appDir: await builtApp() })

    await expectProblem(await api.request('GET', '/api/nothing-here'), 401)
    expect((await api.request('GET', '/api/health')).status).toBe(200)
  })

  it('sends a CSP the PWA works under: its own scripts, fonts and service worker only', async () => {
    const api = await setup({ appDir: await builtApp() })

    const response = await api.request('GET', '/')
    const csp = response.headers.get('content-security-policy') ?? ''
    const directives = new Map(
      csp.split(';').map((directive) => {
        const [name = '', ...sources] = directive.trim().split(/\s+/)
        return [name, sources.join(' ')]
      }),
    )

    expect(directives.get('default-src')).toBe("'self'")
    expect(directives.get('script-src')).toBe("'self'")
    expect(directives.get('worker-src')).toBe("'self'")
    expect(directives.get('manifest-src')).toBe("'self'")
    expect(directives.get('connect-src')).toBe("'self'")
    expect(directives.get('font-src')).toBe("'self'")
    // Plain HTTP stays usable: the tunnel terminates TLS, a local run has none.
    expect(directives.has('upgrade-insecure-requests')).toBe(false)
  })
})
