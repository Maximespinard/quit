// Renders the README screenshots into docs/screenshots/: four screens of the production build,
// each in a phone frame drawn in code. Demo data only: every screen runs in the sandbox, seeded
// from a scenario whose clock is stopped, so each run renders the same images.
// Rerun after a visible change: `npm run screenshots` (builds first).
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium, devices, webkit } from '@playwright/test'
import { preview } from 'vite'

const outDir = new URL('../docs/screenshots/', import.meta.url)

/** Two months in, cravings fading, both step-downs behind: the one scenario with every chart. */
const SCENARIO = 'day-60-cravings'
/** How far into its four minutes the craving timer is caught: a countdown already under way. */
const TIMER_ELAPSED_MS = 83_000
/** WebP quality: the hazes and their grain stay smooth, the four images well under 1.5 MB. */
const QUALITY = 0.86

const phone = devices['iPhone 16 Pro']

/**
 * The frame, drawn around the screen at the device's CSS size: a rounded body, a dark bezel and
 * a faint rim so it keeps its edge on GitHub's dark page. No notch, logo nor button.
 */
const framePage = (screen) => `<!doctype html>
<style>
  html, body { margin: 0; background: transparent; }
  .device {
    display: inline-block; padding: 13px; border-radius: 68px;
    background: #0b0b0d;
    box-shadow: inset 0 0 0 1.5px #3b3b40, inset 0 0 0 5px #17171a;
  }
  .screen {
    display: block; width: ${phone.viewport.width}px; height: ${phone.viewport.height}px;
    border-radius: 55px;
  }
</style>
<div class="device"><img class="screen" src="data:image/png;base64,${screen.toString('base64')}"></div>`

const server = await preview({ logLevel: 'warn', preview: { host: '127.0.0.1', port: 4990 } })
const baseURL = server.resolvedUrls?.local[0]
if (baseURL === undefined) throw new Error('The preview server gave no url')

const sandbox = (path, extra = '') => `${path}?debug=true&scenario=${SCENARIO}${extra}`

/** Each screen: its file, then how to reach it and what to wait for before the capture. */
const SCREENS = [
  {
    file: 'home',
    open: async (page) => {
      await page.goto(sandbox('/'))
      // The streak counts up on launch: wait until each painted figure, drawn right after its
      // screen-reader copy, reads the final value that copy holds.
      await page.waitForFunction(() => {
        const read = (node) => node?.textContent?.trim()
        const final = [...document.querySelectorAll('section[aria-label="Streak"] .sr-only')]
        return (
          final.length > 0 && final.every((copy) => read(copy) === read(copy.nextElementSibling))
        )
      })
    },
  },
  {
    file: 'craving-timer',
    open: async (page) => {
      // Envie gives the sandbox's instant; the timer is then reopened a little after it started.
      await page.goto(sandbox('/'))
      await page.getByRole('button', { name: 'Envie', exact: true }).click()
      await page.getByRole('timer', { name: 'Temps restant' }).waitFor()
      const url = new URL(page.url())
      const startedAt = Number(url.searchParams.get('startedAt'))
      url.searchParams.set('startedAt', String(startedAt - TIMER_ELAPSED_MS))
      await page.goto(url.href)
      await page.getByRole('timer', { name: 'Temps restant' }).waitFor()
    },
  },
  {
    file: 'calendar',
    open: async (page) => {
      await page.goto(sandbox('/calendar'))
      // Two days into July: June shows a full month of patches and the step down to 7 mg.
      await page.getByRole('button', { name: 'Mois précédent' }).click()
      await page.getByText('Juin 2026').waitFor()
    },
  },
  {
    file: 'stats',
    open: async (page) => {
      await page.goto(sandbox('/stats'))
      await page.getByRole('region', { name: 'En bref' }).waitFor()
    },
  },
]

const capturer = await webkit.launch()
const framer = await chromium.launch()
try {
  const app = await capturer.newContext({
    ...phone,
    baseURL,
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    serviceWorkers: 'block',
  })
  const frames = await framer.newContext({
    viewport: { width: 600, height: 1000 },
    deviceScaleFactor: 2,
  })
  await mkdir(outDir, { recursive: true })

  for (const { file, open } of SCREENS) {
    const page = await app.newPage()
    await open(page)
    await page.evaluate(() => document.fonts.ready)
    // The sandbox marker is the debug panel's only trace on screen: out of the picture.
    const screen = await page.screenshot({
      animations: 'disabled',
      style: '[data-sandbox-marker] { visibility: hidden; }',
    })
    await page.close()

    const tab = await frames.newPage()
    await tab.setContent(framePage(screen))
    await tab.locator('.screen').evaluate((img) => img.decode())
    const framed = await tab.locator('.device').screenshot({ omitBackground: true })
    // Chromium's canvas encodes WebP, alpha kept: the corners stay clear on any README theme.
    const webp = await tab.evaluate(
      async ({ png, quality }) => {
        const image = new Image()
        image.src = `data:image/png;base64,${png}`
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        canvas.getContext('2d')?.drawImage(image, 0, 0)
        return canvas.toDataURL('image/webp', quality).split(',')[1] ?? ''
      },
      { png: framed.toString('base64'), quality: QUALITY },
    )
    await tab.close()

    const bytes = Buffer.from(webp, 'base64')
    await writeFile(new URL(`${file}.webp`, outDir), bytes)
    console.log(`docs/screenshots/${file}.webp  ${Math.round(bytes.length / 1024)} kB`)
  }
} finally {
  await capturer.close()
  await framer.close()
  await server.close()
}
