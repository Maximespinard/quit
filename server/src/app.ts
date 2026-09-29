import { randomUUID } from 'node:crypto'
import express, { type ErrorRequestHandler, type RequestHandler, Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import { pinoHttp } from 'pino-http'
import type { Database, Db } from './database.ts'
import { isActiveDeviceKey } from './device-keys.ts'
import type { Logger } from './logger.ts'
import { sendProblem } from './problem.ts'
import { serveApp } from './serve-app.ts'

/** A fact or the settings weigh a few hundred bytes; a whole journal stays far below. */
export const MAX_BODY_BYTES = 100 * 1024

/** Failed device key checks allowed per client address and window, then every request is 429. */
export const AUTH_FAILURES_PER_WINDOW = 10
const AUTH_FAILURE_WINDOW_MS = 15 * 60_000

const BEARER = /^Bearer (\S+)$/i

/** Lets a request through only with the active device key. */
const requireDeviceKey =
  (db: Db): RequestHandler =>
  (req, res, next) => {
    const key = BEARER.exec(req.get('authorization') ?? '')?.[1]
    if (key && isActiveDeviceKey(db, key)) return next()
    res.set('WWW-Authenticate', 'Bearer')
    sendProblem(res, 401, 'A valid device key is required.')
  }

/** What the body parser's errors mean for the client, by their `type`. */
const BODY_ERROR_DETAILS: Record<string, string> = {
  'entity.parse.failed': 'The body is not valid JSON.',
  'entity.too.large': `The body exceeds ${MAX_BODY_BYTES} bytes.`,
}

/** A client error Express's own middleware raised (body parsing): its status and type. */
const clientError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  typeof error.status === 'number' &&
  error.status >= 400 &&
  error.status < 500
    ? { status: error.status, type: 'type' in error ? String(error.type) : '' }
    : undefined

/**
 * Helmet's defaults, tuned for the PWA: every script, font, worker and request comes from this
 * origin (the fonts are bundled, no CDN). No `upgrade-insecure-requests`: TLS ends at the tunnel,
 * and the image run locally over plain HTTP must still load its own assets.
 */
const CONTENT_SECURITY_POLICY = {
  directives: {
    'font-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'worker-src': ["'self'"],
    'manifest-src': ["'self'"],
    'connect-src': ["'self'"],
    'upgrade-insecure-requests': null,
  },
}

/**
 * Every error answers problem+json. The body parser's messages quote the body, so only the
 * status and type are kept from them: a client error is never logged beyond its status line.
 */
const handleError: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error)
  const client = clientError(error)
  if (client) return sendProblem(res, client.status, BODY_ERROR_DETAILS[client.type])
  req.log.error({ err: error }, 'request failed')
  sendProblem(res, 500)
}

/**
 * The HTTP API under `/api`, and the built PWA next to it when `appDir` is given. The health
 * check is open; every other API route, unknown ones included, requires the device key. Logs
 * carry a request id, the method, the path and the status, never a header, a query nor a body.
 */
export function createApp({
  database,
  logger,
  trustProxyHops,
  appDir,
}: {
  database: Database
  logger: Logger
  /** Reverse proxies in front (the tunnel): the rate limit then counts per client address. */
  trustProxyHops: number
  /** The built PWA (`vite build`'s output) to serve outside `/api`. */
  appDir?: string
}) {
  const app = express()
  if (trustProxyHops > 0) app.set('trust proxy', trustProxyHops)

  app.use(
    pinoHttp({
      logger,
      genReqId: (_req, res) => {
        const id = randomUUID()
        res.setHeader('X-Request-Id', id)
        return id
      },
      serializers: {
        req: (req: { id: string; method: string; url: string }) => ({
          id: req.id,
          method: req.method,
          path: req.url.replace(/\?.*$/s, ''),
        }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
      },
      customLogLevel: (_req, res, error) => {
        if (error || res.statusCode >= 500) return 'error'
        return res.statusCode >= 400 ? 'warn' : 'info'
      },
    }),
  )
  app.use(helmet({ contentSecurityPolicy: CONTENT_SECURITY_POLICY }))

  app.get('/api/health', (_req, res) => {
    try {
      database.ping()
    } catch {
      return sendProblem(res, 503, 'The database is unreachable.')
    }
    res.json({ status: 'ok' })
  })

  const api = Router()
  api.use(
    rateLimit({
      windowMs: AUTH_FAILURE_WINDOW_MS,
      limit: AUTH_FAILURES_PER_WINDOW,
      skipSuccessfulRequests: true,
      requestWasSuccessful: (_req, res) => res.statusCode !== 401,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      handler: (_req, res) => sendProblem(res, 429, 'Too many failed attempts, try again later.'),
    }),
  )
  api.use(requireDeviceKey(database.db))
  api.use(express.json({ limit: MAX_BODY_BYTES }))
  api.use((_req, res) => sendProblem(res, 404, 'No such route.'))
  app.use('/api', api)

  if (appDir !== undefined) app.use(serveApp(appDir))
  app.use((_req, res) => sendProblem(res, 404, 'No such file.'))
  app.use(handleError)

  return app
}
