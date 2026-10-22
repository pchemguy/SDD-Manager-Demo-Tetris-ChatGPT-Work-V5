/** Run the real local server with project-assigned managed browsers and fresh contexts. */
import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH = resolve('.cache/browsers');
export default defineConfig({
  testDir: './tests/browser',
  timeout: 10_000,
  globalTimeout: 60_000,
  expect: { timeout: 2000 },
  workers: 1,
  reporter: 'list',
  use: { headless: true, baseURL: 'http://127.0.0.1:4317', viewport: { width: 1280, height: 1000 } },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox', launchOptions:
      process.env.TETRIS_FIREFOX_SANDBOX === '1'
        ? { env: { ...process.env, MOZ_DISABLE_CONTENT_SANDBOX: '1' } } : {} } },
  ],
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4317 --strictPort --mode test',
    url: 'http://127.0.0.1:4317', timeout: 15_000, reuseExistingServer: false,
  },
});
