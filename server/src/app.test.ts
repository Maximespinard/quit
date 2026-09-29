import { PROBLEM_CONTENT_TYPE, problemSchema } from '@quit/contract/problem'
import { afterEach, describe, expect, it } from 'vitest'
import { AUTH_FAILURES_PER_WINDOW, MAX_BODY_BYTES } from './app.ts'
import { closeTestApis, openTestApi } from './test-api.ts'

afterEach(closeTestApis)

/** Asserts a problem+json answer with this status, and returns the problem. */
async function expectProblem(response: Response, status: number) {
  expect(response.status).toBe(status)
  expect(response.headers.get('content-type')).toContain(PROBLEM_CONTENT_TYPE)
  const problem = problemSchema.parse(await response.json())
  expect(problem.status).toBe(status)
  return problem
}

describe('health', () => {
  it('answers 200 without a device key while the database is reachable', async () => {
    const api = await openTestApi()

    const response = await api.request('GET', '/api/health')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok' })
  })

  it('answers 503 once the database is unreachable', async () => {
    const api = await openTestApi()

    api.database.close()
    const response = await api.request('GET', '/api/health')

    await expectProblem(response, 503)
  })
})

describe('device key', () => {
  it('lets a request with the active key through', async () => {
    const api = await openTestApi()
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
    const api = await openTestApi()
    api.issueKey()

    const response = await api.request('GET', '/api/nothing-here', options)

    await expectProblem(response, 401)
    expect(response.headers.get('www-authenticate')).toBe('Bearer')
  })

  it('answers 401 while no key was ever issued', async () => {
    const api = await openTestApi()

    const response = await api.request('GET', '/api/nothing-here', {
      key: 'not-the-device-key-not-the-device-key-000',
    })

    await expectProblem(response, 401)
  })

  it('revokes the previous key when a new one is issued', async () => {
    const api = await openTestApi()
    const first = api.issueKey()
    const second = api.issueKey()

    const revoked = await api.request('GET', '/api/nothing-here', { key: first })
    const active = await api.request('GET', '/api/nothing-here', { key: second })

    expect(second).not.toBe(first)
    await expectProblem(revoked, 401)
    await expectProblem(active, 404)
  })

  it('checks the key before the route: an unknown route without a key answers 401', async () => {
    const api = await openTestApi()

    const response = await api.request('POST', '/anywhere', { body: '{}' })

    await expectProblem(response, 401)
  })
})

describe('errors', () => {
  it('answers 400 to malformed JSON', async () => {
    const api = await openTestApi()
    const key = api.issueKey()

    const response = await api.request('PUT', '/api/nothing-here', { key, body: '{"at": 1' })

    await expectProblem(response, 400)
  })

  it('answers 413 to a body over the size limit', async () => {
    const api = await openTestApi()
    const key = api.issueKey()
    const body = JSON.stringify({ padding: 'x'.repeat(MAX_BODY_BYTES) })

    const response = await api.request('PUT', '/api/nothing-here', { key, body })

    await expectProblem(response, 413)
  })

  it('answers 404 to an unknown route', async () => {
    const api = await openTestApi()
    const key = api.issueKey()

    const response = await api.request('PUT', '/api/nothing-here', { key, body: '{}' })

    await expectProblem(response, 404)
  })
})

describe('rate limit', () => {
  it('refuses every request with 429 once failed attempts reach the limit', async () => {
    const api = await openTestApi()
    const key = api.issueKey()
    const wrong = 'not-the-device-key-not-the-device-key-000'

    for (let attempt = 0; attempt < AUTH_FAILURES_PER_WINDOW; attempt++) {
      await expectProblem(await api.request('GET', '/api/nothing-here', { key: wrong }), 401)
    }
    const guessed = await api.request('GET', '/api/nothing-here', { key })

    await expectProblem(guessed, 429)
  })

  it('does not count requests with the right key', async () => {
    const api = await openTestApi()
    const key = api.issueKey()

    for (let attempt = 0; attempt < AUTH_FAILURES_PER_WINDOW; attempt++) {
      await api.request('GET', '/api/nothing-here', { key })
    }
    const response = await api.request('GET', '/api/nothing-here', { key })

    await expectProblem(response, 404)
  })

  it('counts per client behind a proxy: one client failing does not lock out another', async () => {
    const api = await openTestApi({ trustProxyHops: 1 })
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
    const api = await openTestApi()

    for (let attempt = 0; attempt < AUTH_FAILURES_PER_WINDOW; attempt++) {
      await api.request('GET', '/api/nothing-here')
    }
    const response = await api.request('GET', '/api/health')

    expect(response.status).toBe(200)
  })
})

describe('logs', () => {
  it('log each request with an id, never its body, its query nor the device key', async () => {
    const api = await openTestApi()
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
