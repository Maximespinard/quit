import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <main className="min-h-full bg-(--color-paper) text-(--color-ink)">
      <Outlet />
    </main>
  )
}
