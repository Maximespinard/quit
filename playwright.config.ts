import { defineConfig, devices } from '@playwright/test'
import { apiEnv, apiUrl } from './e2e/mirror-server'

// Two worktrees run their e2e suites at the same time — each picks its own port
// (`scripts/e2e-slot.sh` gives one per slot).
const port = process.env.E2E_PORT ?? '4173'
// E2E_BASE_URL targets an app already running (the image in CI): no preview server then.
const externalURL = process.env.E2E_BASE_URL
const baseURL = externalURL ?? `http://127.0.0.1:${port}`
// WebKit workers are CPU-heavy: two per suite lets three suites share an 8-core machine.
const workers = Number(process.env.E2E_WORKERS ?? 2)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL,
    // No retries: a failure's only trace is the one kept from its single run.
    trace: 'retain-on-failure',
  },
  // Real bundle + service worker: the production preview build, not the dev server.
  // `--host 127.0.0.1` is load-bearing: left to its `localhost` default, Vite binds
  // ::1 first on Linux runners while this url probes IPv4, and the wait times out.
  ...(externalURL
    ? {}
    : {
        webServer: [
          // The mirror's API, empty at each start; the preview proxies `/api` to it.
          {
            command: `rm -rf "${apiEnv.DATA_DIR}" && node server/src/main.ts`,
            url: `${apiUrl}/api/health`,
            env: apiEnv,
            reuseExistingServer: !process.env.CI,
            timeout: 60 * 1000,
            stdout: 'pipe',
            stderr: 'pipe',
          },
          {
            command: `npm run preview -- --host 127.0.0.1 --port ${port} --strictPort`,
            url: baseURL,
            env: { QUIT_API_URL: apiUrl },
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
            stdout: 'pipe',
            stderr: 'pipe',
          },
        ],
      }),
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
