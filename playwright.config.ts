import { defineConfig, devices } from '@playwright/test';

// Browser tests run against the static export in out/ (npm run build first), served the way GitHub
// Pages serves it: under /duitback-web/. Chromium as a desktop, WebKit as an iPhone.
const PORT = 4321;

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://localhost:${PORT}/duitback-web/`, trace: 'retain-on-failure' },
  webServer: {
    command: `node scripts/e2e-serve.mjs ${PORT}`,
    url: `http://localhost:${PORT}/duitback-web/app/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'iphone-webkit', use: { ...devices['iPhone 13'] } },
  ],
});
