import { mkdtemp, rm } from 'node:fs/promises'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { FactId } from '@quit/contract/facts'
import { PROBLEM_CONTENT_TYPE, problemSchema } from '@quit/contract/problem'
import { afterEach, expect } from 'vitest'
import { createApp } from './app.ts'
import { openDatabase } from './database.ts'
import { issueDeviceKey } from './device-keys.ts'
import { createLogger } from './logger.ts'

/**
 * The real app over a real SQLite file in a temporary directory, driven through HTTP: what the
 * server tests share.
 */

export const T0 = new Date('2026-10-01T08:00:00Z')

/** The `n`th fixed fact id: a valid UUIDv7, readable in a failing test. */
export const factId = (n: number): FactId =>
  `00000000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`

const cleanups: (() => Promise<void>)[] = []

afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup()
})

/** Runs `cleanup` once the current test ends, after those registered later. */
export const onCleanup = (cleanup: () => Promise<void>) => void cleanups.push(cleanup)

export interface RequestOptions {
  key?: string | null
  /** Sent as is, with a JSON content type. */
  body?: string
  authorization?: string
  /** The client address a proxy in front would forward. */
  forwardedFor?: string
}

export async function setup({
  trustProxyHops = 0,
  now = () => T0,
  appDir,
}: {
  trustProxyHops?: number
  now?: () => Date
  /** The built PWA to serve outside `/api`; none by default. */
  appDir?: string
} = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'quit-server-'))
  cleanups.push(() => rm(dir, { recursive: true, force: true }))
  const database = openDatabase(dir)
  cleanups.push(async () => database.close())
  const logs: string[] = []
  const logger = createLogger('info', { write: (line: string) => void logs.push(line) })
  const server = createApp({ database, logger, trustProxyHops, now, appDir }).listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  cleanups.push(() => new Promise((resolve) => server.close(() => resolve())))
  const { port } = server.address() as AddressInfo

  function request(method: string, path: string, options: RequestOptions = {}) {
    const headers: Record<string, string> = {}
    if (options.body !== undefined) headers['content-type'] = 'application/json'
    if (options.authorization !== undefined) headers.authorization = options.authorization
    else if (options.key) headers.authorization = `Bearer ${options.key}`
    if (options.forwardedFor) headers['x-forwarded-for'] = options.forwardedFor
    return fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers,
      ...(options.body === undefined ? {} : { body: options.body }),
    })
  }

  return {
    database,
    logs,
    request,
    /** What the issue command does, at T0. */
    issueKey: () => issueDeviceKey(database.db, T0),
  }
}

/** Asserts a problem+json answer with this status, and returns the problem. */
export async function expectProblem(response: Response, status: number) {
  expect(response.status).toBe(status)
  expect(response.headers.get('content-type')).toContain(PROBLEM_CONTENT_TYPE)
  const problem = problemSchema.parse(await response.json())
  expect(problem.status).toBe(status)
  return problem
}
