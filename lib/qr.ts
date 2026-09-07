import { EInvoiceRef, parseMyInvoisUrl } from './myinvois';

/** Decode a QR from raw RGBA pixels (what jsQR wants). Pure, so tests can feed a rasterised matrix. */
export async function decodeQrPixels(data: Uint8ClampedArray, width: number, height: number): Promise<string | null> {
  const { default: jsQR } = await import('jsqr');
  const r = jsQR(data, width, height, { inversionAttempts: 'attemptBoth' });
  return r?.data || null;
}

/** Decode to a bitmap, honouring EXIF rotation from phone cameras where the browser supports the option
 *  (older WebKit throws on it, so fall back to a plain decode rather than fail the scan). */
export async function toBitmap(src: string | Blob): Promise<ImageBitmap> {
  const blob = typeof src === 'string' ? await (await fetch(src)).blob() : src;
  try { return await createImageBitmap(blob, { imageOrientation: 'from-image' }); }
  catch { return createImageBitmap(blob); }
}

function pixels(bmp: ImageBitmap, max: number): ImageData {
  const s = Math.min(2, max / Math.max(bmp.width, bmp.height)); // up to 2x: upscaling gives a tiny QR's modules a few pixels each
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.round(bmp.width * s));
  cv.height = Math.max(1, Math.round(bmp.height * s));
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(bmp, 0, 0, cv.width, cv.height);
  return g.getImageData(0, 0, cv.width, cv.height);
}

/** Decode the QR on a receipt photo (data URL or Blob). Several sizes are tried, cheapest first: jsQR is
 *  happiest around 700–1600px, but a small QR on a full-page printout needs the stored resolution or even a
 *  modest upscale so each module spans a few pixels. Returns the text or null. */
export async function decodeQr(src: string | Blob): Promise<string | null> {
  const bmp = await toBitmap(src);
  try {
    const longest = Math.max(bmp.width, bmp.height);
    for (const max of [1000, 1600, Math.round(longest * 1.5), 700]) {
      const id = pixels(bmp, max);
      const text = await decodeQrPixels(id.data, id.width, id.height);
      if (text) return text;
    }
    return null;
  } finally { bmp.close(); }
}

export type QrScan = { einv: EInvoiceRef } | { einv: null; text: string | null };

/** Look for a MyInvois validation QR on a receipt photo. */
export async function scanForEInvoice(src: string | Blob): Promise<QrScan> {
  const text = await decodeQr(src).catch(() => null);
  const einv = text ? parseMyInvoisUrl(text) : null;
  return einv ? { einv } : { einv: null, text };
}
