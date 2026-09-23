import { useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useLongPress } from '../hooks/useLongPress'

/**
 * The hidden way into the sandbox from the installed PWA, which has no address bar:
 * a long press on the brand sets `?debug=true`. A tap does nothing.
 */
export function SandboxEntry({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const press = useLongPress(() => void navigate({ to: '/', search: { debug: true } }))

  return (
    <span {...press} className="select-none [-webkit-touch-callout:none]">
      {children}
    </span>
  )
}
