// Copy the Tesseract worker + WebAssembly cores from node_modules into public/ocr/engine-<version>/ so the
// app can self-host them (same origin, cached by the service worker, nothing fetched from a CDN at runtime).
// Runs before `next dev` and `next build`; the engine folder is git-ignored. Language packs are committed
// under public/ocr/lang/ (tessdata_fast eng + msa, gzipped).
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const tjs = JSON.parse(readFileSync('node_modules/tesseract.js/package.json', 'utf8')).version;
const ocr = join('public', 'ocr');
for (const d of readdirSync(ocr)) if (d.startsWith('engine-') && d !== `engine-${tjs}`) rmSync(join(ocr, d), { recursive: true, force: true });
const dest = join(ocr, `engine-${tjs}`);
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
copyFileSync('node_modules/tesseract.js/dist/worker.min.js', join(dest, 'worker.min.js'));
const core = 'node_modules/tesseract.js-core';
// only the LSTM-only cores are ever requested (the app loads OEM.LSTM_ONLY); SIMD where the CPU has it, plain otherwise
// the .wasm.js builds are single files with the WebAssembly inlined, so nothing else is fetched
for (const f of ['tesseract-core-simd-lstm.wasm.js', 'tesseract-core-lstm.wasm.js']) copyFileSync(join(core, f), join(dest, f));
const expected = (readFileSync('lib/ocr.ts', 'utf8').match(/ENGINE = 'engine-([^']+)'/) || [])[1];
if (expected && expected !== tjs) throw new Error(`lib/ocr.ts expects tesseract.js ${expected} but ${tjs} is installed — update ENGINE there`);
if (!existsSync(join(ocr, 'lang', 'eng.traineddata.gz'))) throw new Error('public/ocr/lang/eng.traineddata.gz missing');
// pdf.js worker (PDF receipts and e-invoices are rendered on the device before the QR scan and the reader)
const pdfjs = JSON.parse(readFileSync('node_modules/pdfjs-dist/package.json', 'utf8')).version;
for (const d of readdirSync(ocr)) if (d.startsWith('pdfjs-') && d !== `pdfjs-${pdfjs}`) rmSync(join(ocr, d), { recursive: true, force: true });
const pdest = join(ocr, `pdfjs-${pdfjs}`);
rmSync(pdest, { recursive: true, force: true });
mkdirSync(pdest, { recursive: true });
copyFileSync('node_modules/pdfjs-dist/build/pdf.worker.min.mjs', join(pdest, 'pdf.worker.min.mjs'));
const expectedPdf = (readFileSync('lib/pdf.ts', 'utf8').match(/PDFJS = 'pdfjs-([^']+)'/) || [])[1];
if (expectedPdf && expectedPdf !== pdfjs) throw new Error(`lib/pdf.ts expects pdfjs-dist ${expectedPdf} but ${pdfjs} is installed — update PDFJS there`);
console.log('ocr engine assets ->', dest, '| pdf worker ->', pdest);
