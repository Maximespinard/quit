// Renders the app icons into public/: the home haze, its grain, and a white Host Grotesk "q".
// The icons are code, like the hero: this script is their source. Rerun it after changing the
// haze tokens or the typeface: `npm run icons`.
import { readFile, writeFile } from 'node:fs/promises'
import { crc32 } from 'node:zlib'
import { chromium } from '@playwright/test'

const font = await readFile(
  new URL(
    '../node_modules/@fontsource-variable/host-grotesk/files/host-grotesk-latin-wght-normal.woff2',
    import.meta.url,
  ),
)
const publicDir = new URL('../public/', import.meta.url)

/** The home haze's stops (`bg-haze` in src/index.css), recentred for a square. */
const HAZE = `
  radial-gradient(62% 52% at 14% 10%, #b8730f, transparent 70%),
  radial-gradient(58% 50% at 90% 14%, #7a1b5f, transparent 72%),
  radial-gradient(85% 62% at 50% 48%, #8d2a1a, transparent 75%),
  linear-gradient(180deg, #3a1a10 0%, #1c1011 62%, #101012 100%)`

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")`

/**
 * Every icon is drawn on a 512 grid and scaled by the device pixel ratio. `glyph` is the q's
 * size: the maskable one keeps it inside the 80 % safe circle. `radius` rounds the favicon only;
 * iOS and Android mask the others themselves.
 */
const ICONS = [
  { file: 'apple-touch-icon.png', size: 180, glyph: 400, radius: 0 },
  { file: 'pwa-192x192.png', size: 192, glyph: 400, radius: 0 },
  { file: 'pwa-512x512.png', size: 512, glyph: 400, radius: 0 },
  { file: 'pwa-maskable-512x512.png', size: 512, glyph: 320, radius: 0 },
  { file: 'favicon.png', size: 64, glyph: 440, radius: 112 },
]

const page = (glyph, radius) => `<!doctype html>
<style>
  @font-face {
    font-family: 'Host Grotesk';
    src: url(data:font/woff2;base64,${font.toString('base64')}) format('woff2');
    font-weight: 300 800;
  }
  html, body { margin: 0; background: transparent; }
  .icon {
    position: relative; isolation: isolate; overflow: hidden;
    width: 512px; height: 512px; border-radius: ${radius}px;
    background-color: #101012; background-image: ${HAZE};
    display: grid; place-items: center;
  }
  .icon::after {
    content: ''; position: absolute; inset: 0; z-index: -1;
    background-image: ${GRAIN}; opacity: 0.35; mix-blend-mode: overlay;
  }
  .q {
    font: 600 ${glyph}px/1 'Host Grotesk'; letter-spacing: -0.03em; color: #ffffff;
    /* The descender pulls the q low: lift it back onto the optical centre. */
    transform: translateY(-9%);
  }
</style>
<div class="icon"><span class="q">q</span></div>`

/** Every raster carries its origin: a PNG `tEXt` chunk, under the key Impeccable reads. */
const ORIGIN =
  "Origin: rendered from code by scripts/render-icons.mjs (home haze tokens, bg-grain noise, white Host Grotesk 600 'q'); no image generation."

function withOrigin(png) {
  const data = Buffer.from(`impeccable:prompt\0${ORIGIN}`, 'latin1')
  const chunk = Buffer.alloc(12 + data.length)
  chunk.writeUInt32BE(data.length, 0)
  chunk.write('tEXt', 4, 'latin1')
  data.copy(chunk, 8)
  chunk.writeUInt32BE(crc32(chunk.subarray(4, 8 + data.length)), 8 + data.length)
  const iend = png.length - 12
  return Buffer.concat([png.subarray(0, iend), chunk, png.subarray(iend)])
}

const browser = await chromium.launch()
for (const { file, size, glyph, radius } of ICONS) {
  const context = await browser.newContext({
    viewport: { width: 512, height: 512 },
    deviceScaleFactor: size / 512,
  })
  const tab = await context.newPage()
  await tab.setContent(page(glyph, radius))
  await tab.evaluate(() => document.fonts.ready)
  const png = await tab.locator('.icon').screenshot({ omitBackground: radius > 0 })
  await writeFile(new URL(file, publicDir), withOrigin(png))
  await context.close()
  console.log(`public/${file}`)
}
await browser.close()
