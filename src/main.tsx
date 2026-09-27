import { registerSW } from 'virtual:pwa-register'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { checkForUpdateOnReturn } from '@/shared/utils/service-worker'
import { routeTree } from './routeTree.gen'

// autoUpdate: a new build takes over and reloads the page on its own. The journal lives in
// IndexedDB, which the service worker never touches, so it survives every update.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (registration) checkForUpdateOnReturn(registration, document)
  },
})

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
  interface HistoryState {
    /** Set by the navigation that follows a recorded craving: the home screen confirms it. */
    cravingRecorded?: boolean
    /** Set by the navigation that follows a patch application logged from its form. */
    patchRecorded?: boolean
    /** Set by the navigation that follows a declared lapse: the home screen confirms it. */
    lapseRecorded?: boolean
    /** Set by the navigation that follows an edited fact: the history confirms it. */
    factEdited?: boolean
    /** Set by the navigation that follows a deleted fact: the history confirms it. */
    factDeleted?: boolean
  }
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
