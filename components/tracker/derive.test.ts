import { describe, expect, it } from 'vitest';
import { blankInc, calc, Data } from '@/lib/tax';
import { reliefRows } from './derive';

const base = (): Data => ({ profile: { name: 'T', taxNo: '', bank: '', marital: 'single' }, ya: 'YA2026', income: { YA2026: { ...blankInc(), salary: 150000 } }, claims: [], receipts: [], docs: [], status: {} } as unknown as Data);

describe('relief rows for donations', () => {
  it('an unlimited government gift is never flagged over the 10% pool, and the pool stays available', () => {
    const d = base();
    d.claims.push({ id: 'g', ya: 'YA2026', cat: 'donation', sub: 'gov', date: '2026-03-01', desc: 'state government', amount: 40000, receipt: null });
    const row = reliefRows(calc(d, 'YA2026'), 'YA2026').find((r) => r.id === 'donation')!;
    expect(row.over).toBe(false);
    expect(row.allowed).toBe(40000);
    expect(row.leftL).toBe('RM 15,000'); // the whole pool is still free
  });
  it('gifts to approved bodies beyond the pool are flagged over cap', () => {
    const d = base();
    d.claims.push({ id: 'a', ya: 'YA2026', cat: 'donation', sub: 'approved', date: '2026-03-01', desc: 'approved fund', amount: 20000, receipt: null });
    const row = reliefRows(calc(d, 'YA2026'), 'YA2026').find((r) => r.id === 'donation')!;
    expect(row.over).toBe(true);
    expect(row.leftL).toBe('over by RM 5,000');
    expect(row.allowed).toBe(15000);
  });
});
