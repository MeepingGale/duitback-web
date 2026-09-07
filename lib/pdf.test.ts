import { describe, expect, it, vi } from 'vitest';

vi.mock('pdfjs-dist', () => ({ GlobalWorkerOptions: {}, getDocument: vi.fn() }));
import { isPdfDataUrl, receiptImage } from './pdf';

describe('receiptImage', () => {
  it('passes photos through untouched and refuses other files', async () => {
    expect(await receiptImage('data:image/jpeg;base64,AAA')).toBe('data:image/jpeg;base64,AAA');
    expect(await receiptImage('data:text/plain;base64,AAA')).toBeNull();
    expect(await receiptImage(null)).toBeNull();
  });
  it('recognises PDF data URLs', () => {
    expect(isPdfDataUrl('data:application/pdf;base64,JVBERi0')).toBe(true);
    expect(isPdfDataUrl('data:image/png;base64,AAA')).toBe(false);
  });
});
