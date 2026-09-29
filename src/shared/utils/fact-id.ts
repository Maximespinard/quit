import type { FactId } from '@quit/contract/facts'

/** Bytes of randomness a UUIDv7 takes beside its 48-bit instant. */
const RANDOM_BYTES = 10

const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')

/**
 * A UUIDv7 (RFC 9562): `ms` as 48 bits big-endian, then the version, 12 random bits, the
 * variant and 62 more. `random` holds at least ten bytes; the bits the layout needs are masked.
 */
export function uuidv7(ms: number, random: Uint8Array): FactId {
  const bytes = new Uint8Array(16)
  for (let i = 0; i < 6; i += 1) bytes[i] = Math.floor(ms / 2 ** (8 * (5 - i))) % 256
  bytes.set(random.subarray(0, RANDOM_BYTES), 6)
  bytes[6] = 0x70 | ((random[0] ?? 0) & 0x0f)
  bytes[8] = 0x80 | ((random[2] ?? 0) & 0x3f)
  const h = hex(bytes)
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

/** A new fact id, made now on the device. */
export const newFactId = (): FactId =>
  uuidv7(Date.now(), crypto.getRandomValues(new Uint8Array(RANDOM_BYTES)))
