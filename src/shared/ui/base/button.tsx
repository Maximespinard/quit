import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/utils/cn'

/**
 * shadcn `button`, reskinned on the quit tokens (see DESIGN.md › Components › Buttons).
 * Focus rings come from the global `:focus-visible` outline, never from a ring utility.
 */
const buttonVariants = cva(
  'group/button inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full font-medium text-cta transition-[transform,background-color,color] duration-150 ease-out-expo active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:border-transparent disabled:bg-ghost disabled:text-muted motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-5',
  {
    variants: {
      variant: {
        primary: 'bg-ink text-page active:bg-ink/85',
        secondary: 'border border-ghost-line bg-transparent text-ink active:bg-ghost',
        ghost: 'bg-transparent text-ink active:bg-ghost',
        // A hairline in alert at 70 %: 3.8:1, an edge that clears 3:1 like every control's.
        destructive: 'border border-alert/70 bg-transparent text-alert active:bg-alert/10',
        // An underlined text action inside a card, its 44px target kept.
        link: 'justify-start bg-transparent font-normal text-body text-ink underline decoration-ghost-line underline-offset-4',
      },
      size: {
        default: 'h-11 gap-2 px-4',
        sm: 'h-9 gap-1.5 px-3.5 text-label',
        lg: 'h-12 gap-2 px-5',
        icon: 'size-11',
        'icon-sm': 'size-9',
      },
    },
    // Listed after the sizes, so the merge keeps the link flush with the text around it.
    compoundVariants: [{ variant: 'link', className: 'px-0' }],
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
