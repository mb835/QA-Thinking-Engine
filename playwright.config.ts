import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  timeout: 60_000,

  expect: {
    timeout: 10_000,
  },

  fullyParallel: false,

  retries: 0,

  reporter: 'list',

  use: {
    headless: false, // ať vidíš browser
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
