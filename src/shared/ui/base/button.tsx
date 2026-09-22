import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/utils/cn'

/**
 * shadcn `button`, reskinned on the quit tokens (see DESIGN.md → Composants shadcn).
 * Focus rings come from the global `:focus-visible` outline, never from a ring utility.
 */
const buttonVariants = cva(
  'group/button inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-control font-semibold text-body transition-[transform,background-color,color] duration-150 ease-out-expo active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:bg-surface-locked disabled:text-ink-dim motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-5',
  {
    variants: {
      variant: {
        primary: 'bg-action text-page active:bg-ink',
        secondary: 'bg-surface text-ink active:bg-surface-locked',
        outline: 'border border-line bg-transparent text-ink active:bg-surface',
        ghost: 'bg-transparent text-ink active:bg-surface',
        destructive: 'bg-alert/10 text-alert active:bg-alert/20',
      },
      size: {
        default: 'h-11 gap-2 px-4',
        sm: 'h-9 gap-1.5 px-3 text-label',
        lg: 'h-12 gap-2 px-5',
        icon: 'size-11',
        'icon-sm': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'primary',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
