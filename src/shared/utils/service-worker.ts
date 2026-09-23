/** The one part of a `ServiceWorkerRegistration` this module needs. */
type Updatable = { readonly update: () => Promise<unknown> }

/**
 * An installed iOS app is resumed, not reloaded, so the browser's own update check
 * rarely runs. Checking on each return to the foreground lets a new build take over
 * (the autoUpdate registration then reloads the page). Offline, the check just fails.
 */
export function checkForUpdateOnReturn(registration: Updatable, doc: Document): void {
  doc.addEventListener('visibilitychange', () => {
    if (doc.visibilityState === 'visible') registration.update().catch(() => {})
  })
}
