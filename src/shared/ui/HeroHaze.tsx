/**
 * The warm grainy haze behind the home hero, drawn in CSS: no image, so it paints offline
 * and on the first frame. It fills the top 640px and fades into the page. Decorative, so
 * hidden from assistive tech; its parent must be `relative isolate` to hold it behind content.
 */
export function HeroHaze() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-160 bg-haze"
    >
      <div className="absolute inset-0 bg-grain opacity-35 mix-blend-overlay" />
    </div>
  )
}
