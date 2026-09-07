import { createWorker, OEM } from 'tesseract.js';
import type { Worker } from 'tesseract.js';
import { toBitmap } from './qr';

const BASE = '/duitback-web';
/** Folder under public/ocr/ that scripts/ocr-assets.mjs fills from node_modules; it checks this matches the installed version. */
export const ENGINE = 'engine-6.0.1';

export interface OcrProgress { status: string; progress: number }
export interface OcrResult { text: string; confidence: number; ms: number }

// One worker per page, created on first use and released after a quiet spell: the WebAssembly heap is
// tens of megabytes, and a person tags a few receipts then moves on.
let worker: Promise<Worker> | null = null;
let idle: ReturnType<typeof setTimeout> | undefined;
let listener: ((p: OcrProgress) => void) | undefined;

function getWorker(): Promise<Worker> {
  if (!worker) {
    worker = createWorker(['eng', 'msa'], OEM.LSTM_ONLY, {
      workerPath: `${BASE}/ocr/${ENGINE}/worker.min.js`,
      corePath: `${BASE}/ocr/${ENGINE}`,
      langPath: `${BASE}/ocr/lang`,
      workerBlobURL: false, // same origin — load the worker script directly so the service worker can cache it
      logger: (m: { status?: string; progress?: number }) => listener?.({ status: String(m.status || ''), progress: +(m.progress || 0) }),
    }).catch((e) => { worker = null; throw e; });
  }
  return worker;
}

/** Free the engine now (memory back to the page). Safe to call at any time. */
export function releaseOcr(): void {
  clearTimeout(idle);
  const w = worker;
  worker = null;
  w?.then((x) => x.terminate()).catch(() => {});
}
function scheduleRelease(): void { clearTimeout(idle); idle = setTimeout(releaseOcr, 90_000); }

/** Downscale to ~1800px on the long side and turn the photo into a contrast-stretched greyscale PNG —
 *  a phone photo is 3000+px of mostly paper, and the engine reads faster and better from this. */
export async function prepareForOcr(src: string | Blob, max = 1800): Promise<string> {
  const bmp = await toBitmap(src);
  try {
    const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(bmp.width * s));
    cv.height = Math.max(1, Math.round(bmp.height * s));
    const g = cv.getContext('2d', { willReadFrequently: true })!;
    g.drawImage(bmp, 0, 0, cv.width, cv.height);
    const id = g.getImageData(0, 0, cv.width, cv.height);
    const px = id.data;
    const hist = new Uint32Array(256);
    for (let i = 0; i < px.length; i += 4) { const y = ((px[i] * 299 + px[i + 1] * 587 + px[i + 2] * 114) / 1000) | 0; px[i] = y; hist[y]++; }
    const n = px.length / 4;
    let lo = 0, hi = 255, acc = 0;
    for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc > n * 0.02) { lo = v; break; } }
    acc = 0;
    for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc > n * 0.02) { hi = v; break; } }
    const range = Math.max(1, hi - lo);
    for (let i = 0; i < px.length; i += 4) { const y = Math.max(0, Math.min(255, ((px[i] - lo) * 255) / range)); px[i] = px[i + 1] = px[i + 2] = y; }
    g.putImageData(id, 0, 0);
    return cv.toDataURL('image/png');
  } finally { bmp.close(); }
}

/** Read the text on a receipt photo (data URL or Blob) entirely on this device. */
export async function readReceiptImage(src: string | Blob, onProgress?: (p: OcrProgress) => void): Promise<OcrResult> {
  const t0 = performance.now();
  listener = onProgress;
  try {
    onProgress?.({ status: 'preparing image', progress: 0 });
    const img = await prepareForOcr(src);
    const w = await getWorker();
    const { data } = await w.recognize(img, {}, { text: true });
    return { text: data.text || '', confidence: data.confidence || 0, ms: Math.round(performance.now() - t0) };
  } finally {
    listener = undefined;
    scheduleRelease();
  }
}
