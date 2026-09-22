import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/utils/cn'

/** shadcn `toggle`, reskinned: pressed wears the action colour, like every other selection. */
const toggleVariants = cva(
  'group/toggle inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-step font-semibold text-body text-ink-soft transition-colors duration-150 ease-out-expo aria-pressed:bg-action aria-pressed:text-page data-pressed:bg-action data-pressed:text-page disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-5',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-line bg-transparent aria-pressed:border-ink data-pressed:border-ink',
      },
      size: {
        default: 'h-10.5 min-w-10.5 px-3',
        sm: 'h-9 min-w-9 px-2.5 text-label',
        lg: 'h-12 min-w-12 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Toggle({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
