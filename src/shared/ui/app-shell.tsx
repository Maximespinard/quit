import type { ReactNode } from 'react'
import { strings } from '@/shared/utils/strings'

type AppShellProps = {
  /** The brand mark; defaults to the app name. */
  brand?: ReactNode
  children: ReactNode
}

export function AppShell({ brand = strings.app.name, children }: AppShellProps) {
  return (
    // Tall as the screen, so a step can hold its primary action down in the thumb zone.
    <div className="mx-auto flex min-h-svh max-w-md flex-col gap-4 px-safe pt-safe pb-page">
      <h1 className="pt-3 font-semibold text-label">{brand}</h1>
      {children}
    </div>
  )
}
