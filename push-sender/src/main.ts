import { serve } from '@hono/node-server'
import { readConfig } from './config.ts'
import { createApp } from './http.ts'
import { createSender } from './sender.ts'
import { createStateFile } from './state-file.ts'
import { createWebPushTransport } from './web-push-transport.ts'

/** How often the send loop looks for due entries. */
const TICK_MS = 15_000

const log = (message: string) => console.log(`[push-sender] ${message}`)

const config = readConfig(process.env)
const sender = await createSender({
  stateFile: createStateFile(config.dataFile),
  transport: createWebPushTransport(config.vapid),
  now: Date.now,
  log,
})

const server = serve({
  fetch: createApp({ sender, sharedSecret: config.sharedSecret }).fetch,
  port: config.port,
})
const loop = setInterval(() => void sender.tick(), TICK_MS)
void sender.tick()
log(`listening on port ${config.port}`)

function shutdown() {
  clearInterval(loop)
  server.close(() => process.exit(0))
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
