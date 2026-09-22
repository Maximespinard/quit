import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * `@theme` adds font sizes under names tailwind-merge cannot know about, so it reads
 * `text-tab` as a colour and drops it whenever a `text-<colour>` sits in the same call.
 * Registering the size keys keeps size and colour in their own conflict groups.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['display', 'figure', 'title', 'cta', 'body', 'label', 'detail', 'tab'] },
      ],
    },
  },
})

/** Merge Tailwind class lists; later classes win on conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
