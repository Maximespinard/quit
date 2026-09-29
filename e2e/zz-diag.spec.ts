import { expect, test } from '@playwright/test'
import { expectStreak, sandboxAt, startNow } from './sandbox'

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0)

test('diag', async ({ page }) => {
  await page.goto('/')
  await startNow(page)
  await expectStreak(page, 0, '00 h 00')
  await page.goto(sandboxAt(NOW))
  await page.evaluate(() => {
    const log: string[] = []
    ;(window as unknown as { __log: string[] }).__log = log
    const t0 = performance.now()
    const at = () => (performance.now() - t0).toFixed(0)
    const describe = (el: EventTarget | null) =>
      el instanceof Element
        ? `${el.tagName}[${el.getAttribute('aria-label') ?? ''}]:${(el.textContent ?? '').slice(0, 18)}`
        : String(el)
    const button = () =>
      [...document.querySelectorAll('button')].find((x) => x.textContent === 'Jour 29, étape 2')
    let seen: Element | undefined
    new MutationObserver((records) => {
      const b = button()
      if (b !== seen) {
        log.push(`${at()} button node ${seen === undefined ? 'added' : b === undefined ? 'removed' : 'REPLACED'}`)
        seen = b
      }
      for (const r of records)
        if (r.type === 'attributes' && r.target === b)
          log.push(`${at()} attr ${r.attributeName}=${b?.getAttribute(r.attributeName ?? '')}`)
    }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-current'] })
    for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click', 'touchstart', 'touchend']) {
      window.addEventListener(
        type,
        (e) => {
          const r = button()?.getBoundingClientRect()
          const popup = document.querySelector('[data-slot=drawer-popup]')
          const pr = popup?.getBoundingClientRect()
          const pt = e instanceof MouseEvent ? `${e.clientX},${e.clientY}` : ''
          const attrs = popup ? [...popup.attributes].map((a) => a.name).filter((n) => n.startsWith('data-') && !n.startsWith('data-slot') && !n.startsWith('data-swipe')).join(',') : 'no-popup'
          log.push(
            `${at()} ${type} ${pt} ${e instanceof PointerEvent ? e.pointerType : ''} trusted=${e.isTrusted} prevented=${e.defaultPrevented} target=${describe(e.target)} btnY=${r?.y.toFixed(1)} popupY=${pr?.y.toFixed(1)} popupH=${pr?.height.toFixed(1)} ${attrs}`,
          )
        },
        { capture: true },
      )
      window.addEventListener(type, (e) => { if (e.defaultPrevented) log.push(`${at()} ${type} bubbled prevented`) })
    }
  })
  await page.getByRole('button', { name: 'Bac à sable' }).click()
  await page.getByRole('button', { name: 'Jour 29, étape 2', exact: true }).click()
  try {
    await expect(page.getByRole('button', { name: 'Jour 29, étape 2' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  } catch (error) {
    const log = await page.evaluate(() => (window as unknown as { __log: string[] }).__log)
    console.log(`DIAG-FAIL ${JSON.stringify(log, null, 1)}`)
    throw error
  }
})
