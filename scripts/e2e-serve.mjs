// Serve the static export under the site's base path for the browser tests.
import { existsSync, mkdirSync, symlinkSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const port = process.argv[2] || '4321';
if (!existsSync('out/index.html')) { console.error('out/ is missing — run `npm run build` first'); process.exit(1); }
mkdirSync('e2e-srv', { recursive: true });
const link = resolve('e2e-srv/duitback-web');
if (!existsSync(link)) symlinkSync(resolve('out'), link, 'dir');
const bin = resolve('node_modules/.bin/serve');
const child = spawn(bin, ['e2e-srv', '-l', port, '--symlinks', '--no-clipboard', '--no-port-switching'], { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
