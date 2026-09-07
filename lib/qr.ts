import { EInvoiceRef, parseMyInvoisUrl } from './myinvois';

/** Decode a QR from raw RGBA pixels (what jsQR wants). Pure, so tests can feed a rasterised matrix. */
export async function decodeQrPixels(data: Uint8ClampedArray, width: number, height: number): Promise<string | null> {
  const { default: jsQR } = await import('jsqr');
  const r = jsQR(data, width, height, { inversionAttempts: 'attemptBoth' });
  return r?.data || null;
}

async function toBitmap(src: string | Blob): Promise<ImageBitmap> {
  const blob = typeof src === 'string' ? await (await fetch(src)).blob() : src;
  return createImageBitmap(blob, { imageOrientation: 'from-image' }); // honours EXIF rotation from phone cameras
}

function pixels(bmp: ImageBitmap, max: number): ImageData {
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.round(bmp.width * s));
  cv.height = Math.max(1, Math.round(bmp.height * s));
  const g = cv.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(bmp, 0, 0, cv.width, cv.height);
  return g.getImageData(0, 0, cv.width, cv.height);
}

/** Decode the QR on a receipt photo (data URL or Blob). A few sizes are tried: jsQR is happiest around
 *  700–1600px, a phone photo is 3000+ and a small QR disappears when shrunk too far. Returns the text or null. */
export async function decodeQr(src: string | Blob): Promise<string | null> {
  const bmp = await toBitmap(src);
  try {
    for (const max of [1000, 1600, 700]) {
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
