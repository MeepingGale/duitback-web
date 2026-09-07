/** PDF receipts and e-invoices: render the first page on this device so the QR scan and the reader can treat
 *  the document like a photo. pdf.js runs in its own worker, self-hosted under public/ocr/ like the OCR engine
 *  and cached offline by the same service-worker rule. */
const BASE = '/duitback-web';
/** Folder under public/ocr/ that scripts/ocr-assets.mjs fills; it checks this matches the installed pdfjs-dist. */
export const PDFJS = 'pdfjs-5.6.205';

export function isPdfDataUrl(s: string | null | undefined): boolean { return !!s && s.startsWith('data:application/pdf'); }

type PdfJs = typeof import('pdfjs-dist');
let lib: Promise<PdfJs> | null = null;
function pdfjs(): Promise<PdfJs> {
  if (!lib) {
    // Safari before 17.4 has no Promise.withResolvers, which pdf.js relies on
    const P = Promise as unknown as { withResolvers?: unknown };
    if (!P.withResolvers) {
      P.withResolvers = function <T>() {
        let resolve!: (v: T | PromiseLike<T>) => void, reject!: (r?: unknown) => void;
        const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
        return { promise, resolve, reject };
      };
    }
    lib = import('pdfjs-dist').then((m) => { m.GlobalWorkerOptions.workerSrc = `${BASE}/ocr/${PDFJS}/pdf.worker.min.mjs`; return m; })
      .catch((e) => { lib = null; throw e; });
  }
  return lib;
}

async function bytes(src: string | Blob): Promise<Uint8Array> {
  const blob = typeof src === 'string' ? await (await fetch(src)).blob() : src;
  return new Uint8Array(await blob.arrayBuffer());
}

/** Render one page (1-based) to a PNG data URL, at most `maxPx` on the long side. */
export async function renderPdfPage(src: string | Blob, maxPx = 1600, pageNo = 1): Promise<string> {
  const m = await pdfjs();
  const doc = await m.getDocument({ data: await bytes(src), isEvalSupported: false }).promise;
  try {
    const page = await doc.getPage(pageNo);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(4, maxPx / Math.max(base.width, base.height));
    const vp = page.getViewport({ scale });
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(vp.width));
    cv.height = Math.max(1, Math.round(vp.height));
    await page.render({ canvas: cv, viewport: vp }).promise;
    page.cleanup();
    return cv.toDataURL('image/png');
  } finally { await doc.destroy(); }
}

/** The image the scanner and reader look at for a stored file: a photo as it is, a PDF as its first page. */
export async function receiptImage(full: string | null | undefined, maxPx = 1600): Promise<string | null> {
  if (!full) return null;
  if (full.startsWith('data:image/')) return full;
  if (isPdfDataUrl(full)) return renderPdfPage(full, maxPx);
  return null;
}
