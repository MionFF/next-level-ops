import { defineConfig, devices } from '@playwright/test'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

const noProxy = [process.env.NO_PROXY ?? process.env.no_proxy, 'localhost', '127.0.0.1', '::1']
  .filter(Boolean)
  .join(',')

process.env.NO_PROXY = noProxy
process.env.no_proxy = noProxy

export default defineConfig({
  testDir: './e2e',

  workers: 1,
  fullyParallel: false,
  retries: 0,

  // Multi-step operational flows create several related entities and can
  // legitimately exceed Playwright's 30-second default on a local dev server.
  timeout: 90_000,

  expect: {
    timeout: 10_000,
  },

  use: {
    baseURL: 'http://localhost:3000',

    // Prevent a broken individual interaction from consuming the whole test budget.
    actionTimeout: 15_000,
    navigationTimeout: 20_000,

    // `on-first-retry` produced no trace because retries are disabled.
    trace: 'retain-on-failure',
  },

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/sign-in',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
