import { defineConfig, devices } from '@playwright/test'

// Two worktrees run their e2e suites at the same time — each picks its own port
// (`scripts/e2e-slot.sh` gives one per slot).
const port = process.env.E2E_PORT ?? '4173'
const baseURL = `http://127.0.0.1:${port}`
// WebKit workers are CPU-heavy: two per suite lets three suites share an 8-core machine.
const workers = Number(process.env.E2E_WORKERS ?? 2)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  // Real bundle + service worker: the production preview build, not the dev server.
  // `--host 127.0.0.1` is load-bearing: left to its `localhost` default, Vite binds
  // ::1 first on Linux runners while this url probes IPv4, and the wait times out.
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [
    {
      name: 'webkit-iphone-16-pro',
      testIgnore: 'offline.spec.ts',
      use: { ...devices['iPhone 16 Pro'], browserName: 'webkit' },
    },
    // Playwright's WebKit blocks every request once offline, even those the service worker
    // answers from its cache, so the offline proof runs in Chromium at the same size.
    // Offline launch on iOS itself is a manual check on the device.
    {
      name: 'chromium-iphone-16-pro',
      testMatch: 'offline.spec.ts',
      use: { ...devices['iPhone 16 Pro'], browserName: 'chromium' },
    },
  ],
})
