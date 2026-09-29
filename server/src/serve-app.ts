import { extname } from 'node:path'
import express, { type Response, Router } from 'express'

/** Vite puts a content hash in every name under `assets/`: a new build means new URLs. */
const HASHED_ASSETS_PREFIX = '/assets/'
const CACHED_FOR_A_YEAR = 'public, max-age=31536000, immutable'
/**
 * The shell, the service worker, the manifest and the icons keep their names across builds:
 * the browser revalidates them on every load (an ETag makes that a 304), so an update is
 * never stuck behind a stale cache.
 */
const REVALIDATED = 'no-cache'

const setCacheControl = (res: Response) =>
  res.setHeader(
    'Cache-Control',
    res.req.path.startsWith(HASHED_ASSETS_PREFIX) ? CACHED_FOR_A_YEAR : REVALIDATED,
  )

/** A GET for a path without an extension, outside the assets, is a history route. */
const isHistoryRoute = (path: string) =>
  extname(path) === '' && !path.startsWith(HASHED_ASSETS_PREFIX)

/**
 * Serves the built PWA in `appDir`. A history route (a deep link, a reload) gets the shell,
 * whose router resolves it. Anything else not found falls through, so a missing asset is a 404
 * rather than HTML.
 */
export function serveApp(appDir: string) {
  const router = Router()
  router.use(
    express.static(appDir, {
      index: false,
      cacheControl: false,
      setHeaders: setCacheControl,
    }),
  )
  router.get('/{*path}', (req, res, next) => {
    if (!isHistoryRoute(req.path)) return next()
    setCacheControl(res)
    res.sendFile('index.html', { root: appDir, cacheControl: false }, next)
  })
  return router
}
