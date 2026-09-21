import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-4 p-4">
      <h1 className="font-semibold text-xl">Quit</h1>
      {children}
    </div>
  )
}
