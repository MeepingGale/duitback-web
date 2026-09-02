// Give the service worker a per-build cache name so activation drops the previous build's
// chunks instead of accumulating them forever (public/sw.js is copied verbatim, so stamp out/).
import { readFileSync, writeFileSync } from 'node:fs';
const id = (process.env.GITHUB_SHA || String(Date.now())).slice(0, 12);
const file = 'out/sw.js';
const src = readFileSync(file, 'utf8');
if (!src.includes("'duitback-v2'")) throw new Error('sw.js: cache name marker not found');
writeFileSync(file, src.replace("'duitback-v2'", `'duitback-${id}'`));
console.log('service worker cache: duitback-' + id);
