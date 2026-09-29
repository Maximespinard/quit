import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

type CravingButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: string
}

/**
 * The permanent thumb control, Envie: the one lit object on the screen. A 64px pill in the
 * pink → yellow gradient with its pink glow, which nothing else wears; at least 5/8 of the
 * column wide, the mock's 62 %.
 */
export function CravingButton({ label, className, type = 'button', ...rest }: CravingButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-16 min-w-5/8 items-center justify-center rounded-full bg-envie px-7 text-envie text-page transition-transform duration-150 ease-out-expo active:scale-[0.97] disabled:bg-none disabled:bg-ghost disabled:text-muted disabled:shadow-none motion-reduce:transition-none',
        className,
      )}
      {...rest}
    >
      {label}
    </button>
  )
}
