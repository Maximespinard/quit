import { cn } from '@/shared/utils/cn'
import { HAZE_TONE_CLASS, TIMER_HAZE } from '../utils/timer-haze'

/**
 * The craving timer's backdrop: blurred moss and bronze drifting over the page, grain on top.
 * Decorative. Each blob carries its own blur so the drift moves a cached layer instead of
 * re-blurring the screen every frame. The root paints the page itself: `-z-10` makes it its own
 * stacking context, and the grain's `overlay` must blend with the page, as `brightestHazePixel`
 * models it. Over a transparent backdrop it would paint plain white. The parent sets `relative isolate`.
 */
export function CravingHaze({ still = false }: { still?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-page',
        // The timer stopped early: the same haze, dimmed and at rest. Unmarked, never switched off.
        still && 'opacity-60 [&_span]:animate-none',
      )}
    >
      <div data-haze className="absolute -inset-[20%]" style={{ opacity: TIMER_HAZE.opacity }}>
        {TIMER_HAZE.blobs.map((blob) => (
          <span
            key={blob.className}
            style={{ opacity: blob.opacity }}
            className={cn(
              'absolute rounded-full blur-[48px] motion-safe:will-change-transform',
              HAZE_TONE_CLASS[blob.tone],
              blob.className,
            )}
          />
        ))}
      </div>
      <div
        className="absolute inset-0 bg-grain mix-blend-overlay"
        style={{ opacity: TIMER_HAZE.grainOpacity }}
      />
    </div>
  )
}
