import * as z from 'zod/mini'

/**
 * How this device reaches the mirror: the device key pasted in the settings, and whether the
 * server has refused it since — a new key was issued. A refused key keeps the pending changes
 * waiting until a new one is pasted. No link at all: the journal stays on the device only.
 */
const mirrorLinkSchema = z.readonly(
  z.object({ deviceKey: z.string().check(z.minLength(1)), revoked: z.boolean() }),
)
export type MirrorLink = z.infer<typeof mirrorLinkSchema>

/** A device key as pasted: surrounding spaces and line breaks are never part of it. */
export const cleanDeviceKey = (pasted: string): string => pasted.trim()

/** The link as the device stored it; `null` when there is none, or when it cannot be read. */
export function decodeMirrorLink(raw: unknown): MirrorLink | null {
  const link = mirrorLinkSchema.safeParse(raw)
  return link.success ? link.data : null
}
