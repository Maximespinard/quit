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
        // WebKit centres a date field's value and lets it collapse when empty: pinned left, one line tall.
        'h-12 w-full min-w-0 appearance-none rounded-control border border-line bg-ghost px-4 font-medium text-cta text-ink tabular-nums placeholder:font-normal placeholder:text-muted aria-invalid:border-alert disabled:opacity-50 [&::-webkit-date-and-time-value]:min-h-[1lh] [&::-webkit-date-and-time-value]:text-left',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
