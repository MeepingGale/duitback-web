import { describe, expect, it } from 'vitest';
import { buildZip, crc32 } from './zip';

const rd16 = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8);
const rd32 = (b: Uint8Array, o: number) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

describe('zip writer', () => {
  it('crc32 matches the standard check value', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });

  it('writes a valid STORE archive: local headers, central directory, EOCD', () => {
    const enc = new TextEncoder();
    const a = enc.encode('{"hello":"dunia"}');
    const b = enc.encode('receipt bytes');
    const zip = buildZip([{ name: 'duitback-data.json', data: a }, { name: 'receipts/YA2026/x.png', data: b }], new Date(2026, 8, 2, 12, 30, 10));
    // first local header
    expect(rd32(zip, 0)).toBe(0x04034b50);
    expect(rd16(zip, 8)).toBe(0); // STORE
    expect(rd32(zip, 14)).toBe(crc32(a));
    expect(rd32(zip, 18)).toBe(a.length);
    expect(new TextDecoder().decode(zip.slice(30, 30 + 18))).toBe('duitback-data.json');
    // end of central directory
    const eocd = zip.length - 22;
    expect(rd32(zip, eocd)).toBe(0x06054b50);
    expect(rd16(zip, eocd + 10)).toBe(2);
    const cdOffset = rd32(zip, eocd + 16);
    expect(rd32(zip, cdOffset)).toBe(0x02014b50);
    // second central entry points at the second local header
    const firstCdLen = 46 + 18;
    const second = cdOffset + firstCdLen;
    const localOffset = rd32(zip, second + 42);
    expect(rd32(zip, localOffset)).toBe(0x04034b50);
    expect(rd32(zip, localOffset + 14)).toBe(crc32(b));
    // total size = locals + central dir + eocd
    expect(zip.length).toBe(cdOffset + rd32(zip, eocd + 12) + 22);
  });
});
