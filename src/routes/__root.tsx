import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <main className="min-h-dvh bg-page text-ink">
      <Outlet />
    </main>
  )
}
