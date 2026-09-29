import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * `@theme` declares sizes and radii under names tailwind-merge cannot know about: it would read
 * `text-tab` as a colour and drop it next to a `text-<colour>`, and keep both `rounded-control`
 * and `rounded-full`. Registering the names puts each class in its own conflict group.
 * `cn.test.ts` fails when a token is added to `src/index.css` and not here.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'display',
        'brand',
        'craving',
        'figure',
        'title',
        'lead',
        'cta',
        'body',
        'label',
        'detail',
        'tab',
      ],
      radius: ['hero', 'card', 'control', 'step', 'mark'],
    },
  },
})

/** Merge Tailwind class lists; later classes win on conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
