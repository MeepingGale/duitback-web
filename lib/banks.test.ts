import { describe, expect, it } from 'vitest';
import { BANKS, composeBank, maskBank, parseBank } from './banks';

describe('bank picker model', () => {
  it('composes bank + digits canonically, empty when nothing entered', () => {
    expect(composeBank('Maybank', '123456789012')).toBe('Maybank 123456789012');
    expect(composeBank('', '')).toBe('');
    expect(composeBank('CIMB Bank', '')).toBe('CIMB Bank');
  });

  it('parses stored values, including legacy masked ones', () => {
    expect(parseBank('Maybank 123456789012')).toEqual({ bank: 'Maybank', digits: '123456789012' });
    expect(parseBank('Maybank ···8807')).toEqual({ bank: 'Maybank', digits: '8807' }); // legacy demo format
    expect(parseBank('')).toEqual({ bank: '', digits: '' });
    expect(parseBank('Kampung Credit Union 99')).toEqual({ bank: 'Other · Lain-lain', digits: '99' });
  });

  it('strips non-digits and caps account numbers at 17', () => {
    expect(parseBank('Maybank 1234-5678 9012').digits).toBe('123456789012');
    expect(composeBank('BSN', '123456789012345678901')).toBe('BSN 12345678901234567');
  });

  it('masks to bank + last four for display', () => {
    expect(maskBank('Maybank 123456789012')).toBe('Maybank ···9012');
    expect(maskBank('CIMB Bank')).toBe('CIMB Bank');
    expect(maskBank('')).toBe('');
  });

  it('every bank has a chip monogram (≤4 chars) and a colour', () => {
    for (const b of BANKS) {
      expect(b.abbr.length).toBeGreaterThan(0);
      expect(b.abbr.length).toBeLessThanOrEqual(4);
      expect(b.color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('verified IBG lengths are present for the big banks', () => {
    const len = (n: string) => BANKS.find((b) => b.name === n)?.len;
    expect(len('Maybank')).toBe(12);
    expect(len('CIMB Bank')).toBe(10);
    expect(len('Public Bank')).toBe(10);
    expect(len('RHB Bank')).toBe(14);
    expect(len('Hong Leong Bank')).toBe(11);
    expect(len('AmBank')).toBe(13);
    expect(len('BSN')).toBe(16);
  });
});
