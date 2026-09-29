import avif768 from '@/assets/hero-night-768.avif'
import webp768 from '@/assets/hero-night-768.webp'
import avif1152 from '@/assets/hero-night-1152.avif'
import webp1152 from '@/assets/hero-night-1152.webp'
import avif1536 from '@/assets/hero-night-1536.avif'
import webp1536 from '@/assets/hero-night-1536.webp'

const AVIF_SRCSET = `${avif768} 768w, ${avif1152} 1152w, ${avif1536} 1536w`
const WEBP_SRCSET = `${webp768} 768w, ${webp1152} 1152w, ${webp1536} 1536w`

/** The hero spans the app column: 448px from that breakpoint up, the viewport below it. */
const SIZES = '(min-width: 448px) 448px, 100vw'

/**
 * The night seascape behind the streak figure. Decorative, so it is hidden from
 * assistive tech; `bg-page` on the hero stays the floor if the image never arrives.
 * Eager and high priority on purpose: it paints with the first viewport.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      <picture>
        <source type="image/avif" srcSet={AVIF_SRCSET} sizes={SIZES} />
        <img
          src={webp1536}
          srcSet={WEBP_SRCSET}
          sizes={SIZES}
          alt=""
          width={1536}
          height={1024}
          decoding="async"
          fetchPriority="high"
          className="size-full object-cover"
        />
      </picture>
      {/* Contrast scrim, not decoration: the waves lighten the band the label and clock sit in. */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-page/75 to-transparent" />
    </div>
  )
}
