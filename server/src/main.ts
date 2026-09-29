import { createApp } from './app.ts'
import { readConfigOrExit } from './config.ts'
import { openDatabase } from './database.ts'
import { createLogger } from './logger.ts'

/** How long in-flight requests get to finish on shutdown before their connections are cut. */
const SHUTDOWN_GRACE_MS = 10_000
const IDLE_SWEEP_MS = 50

const config = readConfigOrExit(process.env)
const logger = createLogger(config.logLevel)
const database = openDatabase(config.dataDir)

const server = createApp({ database, logger }).listen(config.port, (error) => {
  if (error) throw error
  logger.info({ port: config.port }, 'listening')
})

/**
 * Stops accepting connections, lets in-flight requests finish, then closes the database: a
 * change the server acknowledged is on disk before the process exits.
 */
function shutdown(signal: NodeJS.Signals) {
  logger.info({ signal }, 'shutting down')
  const cut = setTimeout(() => server.closeAllConnections(), SHUTDOWN_GRACE_MS)
  cut.unref()
  // close() drops the connections idle right now only; a keep-alive connection whose request
  // was in flight would otherwise hold the process until its keep-alive timeout.
  const dropIdle = setInterval(() => server.closeIdleConnections(), IDLE_SWEEP_MS)
  server.close(() => {
    clearTimeout(cut)
    clearInterval(dropIdle)
    database.close()
    logger.info('database closed')
  })
}
process.once('SIGTERM', shutdown)
process.once('SIGINT', shutdown)
