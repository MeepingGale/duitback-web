// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { dataUrlToBytes, emptyData, vaultEntries } from './data';

describe('vault export', () => {
  it('decodes base64 data URLs into bytes with their mime type', () => {
    const { bytes, mime } = dataUrlToBytes('data:image/png;base64,' + btoa('PNGDATA'));
    expect(mime).toBe('image/png');
    expect(new TextDecoder().decode(bytes)).toBe('PNGDATA');
  });

  it('bundles the JSON, a README and every receipt original (by year), skipping items without a stored file', async () => {
    const d = emptyData();
    d.profile.name = 'Nick';
    d.receipts.push(
      { id: 'r1', ya: 'YA2026', cat: 'lifestyle', name: 'Kedai Ujian (Sept).png', sub: '', thumb: 'x', hasFull: true },
      { id: 'r2', ya: 'YA2025', cat: null, name: 'no-file.jpg', sub: '', thumb: null, hasFull: false },
      { id: 'r3', ya: 'YA2026', cat: null, name: 'statement.pdf', sub: '', thumb: null, hasFull: true },
    );
    const files: Record<string, string> = {
      r1: 'data:image/png;base64,' + btoa('png-bytes'),
      r3: 'data:application/pdf;base64,' + btoa('%PDF-1.4'),
    };
    const entries = await vaultEntries(d, async (id) => files[id] || null);
    expect(entries.map((e) => e.name)).toEqual([
      'duitback-data.json',
      'README.txt',
      'receipts/YA2026/Kedai_Ujian_Sept_-r1.png',
      'receipts/YA2026/statement-r3.pdf',
    ]);
    const json = JSON.parse(new TextDecoder().decode(entries[0].data));
    expect(json.profile.name).toBe('Nick');
    expect(new TextDecoder().decode(entries[3].data)).toBe('%PDF-1.4');
  });
});
