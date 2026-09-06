import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname) } },
  test: { exclude: ['e2e/**', 'node_modules/**'], testTimeout: 15000 }, // e2e/ is Playwright's; the tracker's 1.2 s install-guide timer needs headroom under a loaded CPU
});
