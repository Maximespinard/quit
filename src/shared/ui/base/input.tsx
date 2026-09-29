import type * as React from 'react'
import { cn } from '@/shared/utils/cn'

/**
 * shadcn `input`, reskinned: a ghost field edged with a hairline, cream figures, a muted
 * placeholder, the alert hairline while `aria-invalid`. Focus rides the global outline.
 */
function Input({ className, type = 'text', ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 rounded-control border border-line bg-ghost px-4 font-medium text-cta text-ink tabular-nums placeholder:font-normal placeholder:text-muted aria-invalid:border-alert disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
