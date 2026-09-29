import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { isNull } from 'drizzle-orm'
import type { Db } from './database.ts'
import { deviceKeys } from './schema.ts'

/** 256 bits of randomness, far beyond any guessing through a rate-limited API. */
const KEY_BYTES = 32

const sha256 = (key: string) => createHash('sha256').update(key).digest()

/**
 * Issues a new device key and revokes the active one, in one transaction. Returns the key:
 * only its hash is stored, so this is the one time it can be read.
 */
export function issueDeviceKey(db: Db, now: Date): string {
  const key = randomBytes(KEY_BYTES).toString('base64url')
  db.transaction((tx) => {
    tx.update(deviceKeys).set({ revokedAt: now }).where(isNull(deviceKeys.revokedAt)).run()
    tx.insert(deviceKeys)
      .values({ hash: sha256(key).toString('hex'), issuedAt: now })
      .run()
  })
  return key
}

/** Whether `key` is the active device key, compared in constant time. */
export function isActiveDeviceKey(db: Db, key: string): boolean {
  const active = db
    .select({ hash: deviceKeys.hash })
    .from(deviceKeys)
    .where(isNull(deviceKeys.revokedAt))
    .get()
  const presented = sha256(key)
  if (!active) return false
  return timingSafeEqual(Buffer.from(active.hash, 'hex'), presented)
}
