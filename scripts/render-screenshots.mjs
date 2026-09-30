// Renders the README screenshots into docs/screenshots/: four screens of the production build,
// each in a phone frame drawn in code. Never the real journal: every screen runs in the sandbox,
// seeded from a scenario whose clock is stopped, so each run renders the same images.
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

const device = devices['iPhone 16 Pro Max']
/** Installed on the home screen, the PWA fills the whole screen: no Safari bars to subtract. */
const phone = { ...device, viewport: device.screen }

/**
 * README only, never the app: the showcase leaves out what a reader cannot follow without a
 * relapse to explain it, and shows the rate a journey held this well would reach.
 */
const SHOWCASE_HELD_PERCENT = '99'

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

const sandbox = (path) => `${path}?debug=true&scenario=${SCENARIO}`

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
      const timer = page.getByRole('timer', { name: 'Temps restant' })
      await page.getByRole('button', { name: 'Envie', exact: true }).click()
      await timer.waitFor()
      const url = new URL(page.url())
      const startedAt = Number(url.searchParams.get('startedAt') ?? Number.NaN)
      if (!Number.isFinite(startedAt)) throw new Error(`No timer start in ${url.href}`)
      url.searchParams.set('startedAt', String(startedAt - TIMER_ELAPSED_MS))
      await page.goto(url.href)
      await timer.waitFor()
    },
  },
  {
    file: 'calendar',
    open: async (page) => {
      await page.goto(sandbox('/calendar'))
      // The scenario's clock stops on 2 July: June is a fully lived month, its days shaded by cravings.
      await page.getByRole('button', { name: 'Mois précédent' }).click()
      await page.getByText('Juin 2026').waitFor()
    },
  },
  {
    file: 'stats',
    open: async (page) => {
      await page.goto(sandbox('/stats'))
      await page.getByRole('region', { name: 'En bref' }).waitFor()
      await page.evaluate((percent) => {
        const term = [...document.querySelectorAll('dt')].find(
          (node) => node.textContent === 'Tenues jusqu’au bout',
        )
        const figure = [...(term?.nextElementSibling?.childNodes ?? [])].find(
          (node) => node.nodeType === Node.TEXT_NODE,
        )
        if (figure === undefined) throw new Error('No held-to-the-end figure on the stats screen')
        figure.textContent = figure.textContent.replace(/\d+/, percent)
      }, SHOWCASE_HELD_PERCENT)
    },
  },
]

const server = await preview({ logLevel: 'warn', preview: { host: '127.0.0.1', port: 4990 } })
const browsers = []
try {
  const baseURL = server.resolvedUrls?.local[0]
  if (baseURL === undefined) throw new Error('The preview server gave no url')
  const capturer = await webkit.launch()
  browsers.push(capturer)
  const framer = await chromium.launch()
  browsers.push(framer)
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
        return canvas.toDataURL('image/webp', quality)
      },
      { png: framed.toString('base64'), quality: QUALITY },
    )
    await tab.close()

    // A canvas that cannot encode WebP falls back to PNG: never write that under a .webp name.
    const [header, data] = webp.split(',')
    if (header !== 'data:image/webp;base64' || !data) throw new Error(`${file}: no WebP encoded`)
    const bytes = Buffer.from(data, 'base64')
    await writeFile(new URL(`${file}.webp`, outDir), bytes)
    console.log(`docs/screenshots/${file}.webp  ${Math.round(bytes.length / 1024)} kB`)
  }
} finally {
  await Promise.allSettled(browsers.map((browser) => browser.close()))
  await server.close()
}
