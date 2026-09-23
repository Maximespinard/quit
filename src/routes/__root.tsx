import { createRootRoute, Outlet } from '@tanstack/react-router'
import { DebugPanel } from '@/features/debug/components/DebugPanel'
import { JournalSourceProvider } from '@/shared/ui/JournalSourceProvider'
import { validateAppSearch } from '@/shared/utils/app-search'
import { cn } from '@/shared/utils/cn'

export const Route = createRootRoute({
  validateSearch: validateAppSearch,
  component: RootLayout,
})

function RootLayout() {
  const { debug, clock } = Route.useSearch()
  const sandbox = debug === true

  return (
    <JournalSourceProvider sandbox={sandbox} clockAt={clock ?? null}>
      {/* The sandbox marker is a fixed pill: content keeps clear of it. */}
      <main className={cn('min-h-dvh bg-page text-ink', sandbox && 'pb-24')}>
        <Outlet />
      </main>
      {sandbox ? <DebugPanel /> : null}
    </JournalSourceProvider>
  )
}
