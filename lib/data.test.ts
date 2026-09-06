import { describe, expect, it } from 'vitest';
import { tidy } from './data';
import type { Data } from './tax';

describe('tidy', () => {
  it('drops claim pointers to receipts that no longer exist, per year of assessment', () => {
    const d = {
      claims: [
        { id: 'a', ya: 'YA2026', cat: 'lifestyle', date: '2026-01-01', desc: 'kept', amount: 1, receipt: 'r.png' },
        { id: 'b', ya: 'YA2026', cat: 'lifestyle', date: '2026-01-01', desc: 'gone', amount: 1, receipt: 'gone.png' },
        { id: 'c', ya: 'YA2025', cat: 'lifestyle', date: '2025-01-01', desc: 'other year', amount: 1, receipt: 'r.png' },
      ],
      receipts: [{ id: 'ra', ya: 'YA2026', cat: 'lifestyle', name: 'r.png', sub: '', thumb: null, hasFull: false }],
    } as unknown as Data;
    tidy(d);
    expect(d.claims.map((c) => c.receipt)).toEqual(['r.png', null, null]);
  });
});
