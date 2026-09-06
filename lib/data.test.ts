import { describe, expect, it } from 'vitest';
import { parseImport, tidy } from './data';
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

  it('fills the fields an older or hand-made backup may lack, so every screen can render it', () => {
    const r = parseImport(JSON.stringify({ ya: 'YA2026', profile: { name: 'Old export', bank: null }, claims: [], income: { YA2026: { salary: 90000 } } }));
    expect(r.error).toBeUndefined();
    const d = r.data!;
    expect(d.profile).toMatchObject({ name: 'Old export', taxNo: '', bank: '', marital: 'single' });
    expect(d.receipts).toEqual([]);
    expect(d.docs).toEqual([]);
    expect(d.status.YA2026).toEqual({ stage: 'tracking' });
  });

  it('points ya at a year that exists', () => {
    const d = parseImport(JSON.stringify({ ya: 'YA2030', profile: {}, claims: [], income: { YA2025: {} } })).data!;
    expect(d.ya).toBe('YA2025');
  });
});
