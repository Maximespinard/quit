import { createApp } from './app.ts'
import { readConfigOrExit } from './config.ts'
import { openDatabase } from './database.ts'
import { createLogger } from './logger.ts'
import { createPushSender, startSendLoop } from './push-sender.ts'
import { createWebPushTransport } from './web-push-transport.ts'

/** How long in-flight requests get to finish on shutdown before their connections are cut. */
const SHUTDOWN_GRACE_MS = 10_000
const IDLE_SWEEP_MS = 50
/** How often the send loop looks for due pushes. */
const SEND_LOOP_MS = 15_000

const config = readConfigOrExit(process.env)
const logger = createLogger(config.logLevel)
const database = openDatabase(config.dataDir)

const pushSender = createPushSender({
  db: database.db,
  transport: createWebPushTransport(config.vapid),
  now: () => new Date(),
  logger,
})
const sendLoop = startSendLoop(pushSender, SEND_LOOP_MS)

const app = createApp({
  database,
  logger,
  trustProxyHops: config.trustProxyHops,
  appDir: config.appDir,
  now: () => new Date(),
  pushSender,
})
const server = app.listen(config.port, (error) => {
  if (error) {
    logger.fatal({ err: error, port: config.port }, 'cannot listen')
    process.exit(1)
  }
  logger.info({ port: config.port }, 'listening')
})

/**
 * Stops the send loop and accepting connections, lets the push run and the requests in flight
 * finish, then closes the database: a change the server acknowledged is on disk before the
 * process exits.
 */
function shutdown(signal: NodeJS.Signals) {
  logger.info({ signal }, 'shutting down')
  const sendLoopStopped = sendLoop.stop()
  const cut = setTimeout(() => server.closeAllConnections(), SHUTDOWN_GRACE_MS)
  cut.unref()
  // close() drops the connections idle right now only; a keep-alive connection whose request
  // was in flight would otherwise hold the process until its keep-alive timeout.
  const dropIdle = setInterval(() => server.closeIdleConnections(), IDLE_SWEEP_MS)
  server.close(async () => {
    clearTimeout(cut)
    clearInterval(dropIdle)
    await sendLoopStopped
    database.close()
    logger.info('database closed')
  })
}
process.once('SIGTERM', shutdown)
process.once('SIGINT', shutdown)
