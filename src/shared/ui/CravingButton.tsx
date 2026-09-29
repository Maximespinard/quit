import { Timer } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

type CravingButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: string
}

/** The permanent thumb control, 64px tall. Its look is the Envie ticket's; until then a cream pill. */
export function CravingButton({ label, className, type = 'button', ...rest }: CravingButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-16 min-w-16 items-center justify-center gap-2 rounded-full bg-ink px-6 text-cta text-page transition-transform duration-150 ease-out-expo active:scale-[0.97] disabled:bg-ghost disabled:text-muted motion-reduce:transition-none',
        className,
      )}
      {...rest}
    >
      <Timer aria-hidden="true" className="size-5" strokeWidth={1.75} />
      {label}
    </button>
  )
}
