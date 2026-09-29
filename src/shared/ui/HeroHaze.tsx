import { cn } from '@/shared/utils/cn'

/** `hero`: the full haze, top 640px (home, first launch). `band`: its low band behind a screen's top bar and title. */
const LOOK = {
  hero: 'h-160 bg-haze',
  band: 'h-48 bg-haze-band opacity-70',
} as const

type HeroHazeProps = { look?: keyof typeof LOOK }

/**
 * The warm grainy haze, drawn in CSS: no image, so it paints offline and on the first frame. It
 * fades into the page. Decorative, so hidden from assistive tech; its parent must be
 * `relative isolate` to hold it behind content.
 */
export function HeroHaze({ look = 'hero' }: HeroHazeProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-x-0 top-0 -z-10 mask-haze', LOOK[look])}
    >
      <div className="absolute inset-0 bg-grain opacity-35 mix-blend-overlay" />
    </div>
  )
}
