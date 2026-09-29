import { issueDeviceKey } from './auth/device-keys.ts'
import { readConfigOrExit } from './config.ts'
import { openDatabase } from './db/database.ts'

/**
 * Issues a new device key and revokes the previous one. Run where the server runs, against the
 * same DATA_DIR. The key goes to stdout alone, the explanation to stderr.
 */
const config = readConfigOrExit(process.env)
const database = openDatabase(config.dataDir)
const key = issueDeviceKey(database.db, new Date())
database.close()

console.error('New device key. It is shown only this once; the previous key no longer works.')
console.log(key)
