import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/shared/ui/app-shell'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return <AppShell>Scaffold prêt.</AppShell>
}
