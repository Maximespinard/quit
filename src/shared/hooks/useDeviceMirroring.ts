import { useEffect, useState } from 'react'
import type { MirrorLink } from '@/shared/domain/mirror-link'
import {
  deviceJournalStore,
  deviceLinkStore,
  devicePendingStore,
  type JournalStore,
} from '@/shared/storage/journal-store'
import { createMirroring } from '@/shared/storage/mirroring'

/** Where this device stands with the mirror, as the settings show it. */
export type MirrorState = 'loading' | 'unlinked' | 'linked' | 'revoked'

export type MirrorControls = {
  readonly state: MirrorState
  /** Links this device with a pasted device key, then sends the pending changes. */
  readonly link: (pastedKey: string) => Promise<void>
}

const stateOf = (link: MirrorLink | null | undefined): MirrorState => {
  if (link === undefined) return 'loading'
  if (link === null) return 'unlinked'
  return link.revoked ? 'revoked' : 'linked'
}

/**
 * The real journal's store, mirrored (ADR-0003). Pending changes leave after each save, at
 * launch, when the network comes back and when the app returns to the foreground: iOS gives a
 * PWA no background sync. Only the real journal uses it — never the sandbox nor demo mode.
 */
export function useDeviceMirroring(): { store: JournalStore; mirror: MirrorControls } {
  const [link, setLink] = useState<MirrorLink | null | undefined>(undefined)
  const [mirroring] = useState(() =>
    createMirroring({
      journal: deviceJournalStore,
      pending: devicePendingStore,
      link: deviceLinkStore,
      onLinkChange: setLink,
    }),
  )

  useEffect(() => {
    let cancelled = false
    mirroring
      .loadLink()
      .catch(() => null)
      .then((loaded) => {
        if (!cancelled) setLink(loaded)
      })
    const sendNow = () => void mirroring.send()
    const sendIfShown = () => {
      if (document.visibilityState === 'visible') sendNow()
    }
    sendNow()
    window.addEventListener('online', sendNow)
    document.addEventListener('visibilitychange', sendIfShown)
    return () => {
      cancelled = true
      window.removeEventListener('online', sendNow)
      document.removeEventListener('visibilitychange', sendIfShown)
      mirroring.stop()
    }
  }, [mirroring])

  return { store: mirroring.journal, mirror: { state: stateOf(link), link: mirroring.link } }
}
