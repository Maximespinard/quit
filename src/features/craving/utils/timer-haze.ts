import { mix, type Rgb, relativeLuminance } from '@/shared/utils/color'

/** The colour tokens the timer haze paints with. */
export type HazeTone = 'bronze' | 'moss' | 'page'

export const HAZE_TONE_CLASS: Record<HazeTone, string> = {
  bronze: 'bg-bronze',
  moss: 'bg-moss',
  page: 'bg-page',
}

type HazeBlob = {
  tone: HazeTone
  opacity: number
  /** Place, size and drift. The drift sits behind `motion-safe:`: reduced motion is a still frame. */
  className: string
}

type Haze = {
  /** Painted in order, each one blurred. */
  blobs: readonly HazeBlob[]
  /** The whole liquid layer over the page: the knob that holds the countdown's contrast. */
  opacity: number
  /** The grain laid over it in `overlay`, which only ever lightens. */
  grainOpacity: number
}

/**
 * monopo's slow liquid, as the visual target draws it: two bronze blobs, one moss, one dark,
 * drifting over the page. Its opacities come out of the contrast test, not out of taste.
 */
export const TIMER_HAZE: Haze = {
  blobs: [
    {
      tone: 'bronze',
      opacity: 0.75,
      className:
        'top-[18%] left-[5%] h-[45%] w-[70%] motion-safe:animate-[haze-drift-a_16s_ease-in-out_infinite_alternate]',
    },
    {
      tone: 'moss',
      opacity: 1,
      className:
        'top-[40%] right-0 h-[50%] w-[75%] motion-safe:animate-[haze-drift-b_19s_ease-in-out_infinite_alternate]',
    },
    {
      tone: 'bronze',
      opacity: 0.55,
      className:
        'top-[62%] left-[25%] h-[35%] w-[55%] motion-safe:animate-[haze-drift-a_22s_ease-in-out_infinite_alternate-reverse]',
    },
    {
      tone: 'page',
      opacity: 1,
      className:
        'top-[55%] -left-[5%] h-[40%] w-[60%] motion-safe:animate-[haze-drift-b_14s_ease-in-out_infinite_alternate]',
    },
  ],
  opacity: 0.65,
  grainOpacity: 0.2,
}

/** The strongest alpha the grain's fractal noise reaches, per its colour matrix below. */
const GRAIN_NOISE_ALPHA = 0.9

/** Fine white fractal noise, as in the visual target: Suno's and monopo's grain. */
export const GRAIN_IMAGE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 ${GRAIN_NOISE_ALPHA} 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")`

/** White in `overlay` mode at `alpha`: dark channels double, light ones go to white. */
const overlayWhite = ([r, g, b]: Rgb, alpha: number): Rgb => {
  const lit = (channel: number) => (channel <= 0.5 ? 2 * channel : 1)
  return mix([r, g, b], [lit(r), lit(g), lit(b)], alpha)
}

/**
 * The brightest pixel any frame of the haze can paint. Blobs drift, so any subset of them may
 * overlap on one pixel: every subset is painted at full opacity, in order, then dimmed by the
 * layer and lit by the grain at its strongest. Blur only ever lowers these peaks.
 */
export function brightestHazePixel(palette: Record<HazeTone, Rgb>, haze: Haze): Rgb {
  const { blobs, opacity, grainOpacity } = haze
  let brightest = palette.page
  for (let subset = 0; subset < 2 ** blobs.length; subset++) {
    const stack = blobs.reduce<Rgb>(
      (pixel, blob, index) =>
        (subset >> index) & 1 ? mix(pixel, palette[blob.tone], blob.opacity) : pixel,
      palette.page,
    )
    const pixel = overlayWhite(mix(palette.page, stack, opacity), grainOpacity * GRAIN_NOISE_ALPHA)
    if (relativeLuminance(pixel) > relativeLuminance(brightest)) brightest = pixel
  }
  return brightest
}
