import { defineConfig, devices } from '@playwright/test'

// Two worktrees run their e2e suites at the same time — each picks its own port.
const port = process.env.E2E_PORT ?? '4173'
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  // Real bundle + service worker: the production preview build, not the dev server.
  webServer: {
    command: `npm run preview -- --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: 'webkit-iphone',
      use: { ...devices['iPhone 13'], browserName: 'webkit' },
    },
  ],
})
