import { createRootRoute, Outlet } from '@tanstack/react-router'
import { DebugPanel } from '@/features/debug/components/DebugPanel'
import { JournalSourceProvider } from '@/shared/ui/JournalSourceProvider'
import { journalSourceFrom, validateAppSearch } from '@/shared/utils/app-search'
import { cn } from '@/shared/utils/cn'

export const Route = createRootRoute({
  validateSearch: validateAppSearch,
  component: RootLayout,
})

function RootLayout() {
  const source = journalSourceFrom(Route.useSearch())

  return (
    <JournalSourceProvider source={source}>
      {/* The Fixed Pill Rule: content keeps clear of the sandbox marker and the home indicator. */}
      <main
        className={cn(
          'min-h-dvh bg-page text-ink',
          source.kind === 'sandbox' && 'pb-[calc(5rem+env(safe-area-inset-bottom))]',
        )}
      >
        <Outlet />
      </main>
      <DebugPanel />
    </JournalSourceProvider>
  )
}
