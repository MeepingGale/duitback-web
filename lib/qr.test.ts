import { describe, expect, it } from 'vitest';
import QRCode from 'qrcode';
import { decodeQrPixels } from './qr';

/** Rasterise a QR matrix into RGBA pixels the way a canvas would, with a quiet zone. */
function raster(text: string, scale = 6, margin = 4): { data: Uint8ClampedArray; size: number } {
  const q = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const n = q.modules.size;
  const size = (n + 2 * margin) * scale;
  const data = new Uint8ClampedArray(size * size * 4).fill(255);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (!q.modules.get(x, y)) continue;
    for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
      const i = (((y + margin) * scale + dy) * size + (x + margin) * scale + dx) * 4;
      data[i] = data[i + 1] = data[i + 2] = 0;
    }
  }
  return { data, size };
}

describe('decodeQrPixels', () => {
  it('decodes a MyInvois validation link drawn as a QR', async () => {
    const url = 'https://myinvois.hasil.gov.my/F9D425P6DS7D8IU/share/7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d';
    const { data, size } = raster(url);
    expect(await decodeQrPixels(data, size, size)).toBe(url);
  });
  it('returns null for a blank image', async () => {
    const size = 200;
    expect(await decodeQrPixels(new Uint8ClampedArray(size * size * 4).fill(255), size, size)).toBeNull();
  });
});
