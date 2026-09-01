import { describe, expect, it } from 'vitest';
import { blankInc, calc, capFor, Data, jointComparison, medSum, taxOn } from './tax';
import { demoData, parseImport } from './data';

describe('taxOn — YA2025 resident scale', () => {
  // cumulative tax at each bracket edge, per the LHDN schedule
  it.each([
    [0, 0],
    [5000, 0],
    [20000, 150],
    [35000, 600],
    [50000, 1500],
    [70000, 3700],
    [100000, 9400],
    [150000, 21900],
    [400000, 84400],
    [600000, 136400],
  ])('taxOn(%i) = %i', (ci, expected) => {
    expect(taxOn(ci)).toBe(expected);
  });

  it('never returns negative', () => {
    expect(taxOn(-500)).toBe(0);
  });
});

describe('capFor — per-YA schedule overrides', () => {
  it('uses the current cap by default', () => {
    expect(capFor('lifestyle', 2026)).toBe(2500);
    expect(capFor('sports', 2026)).toBe(1000);
    expect(capFor('housing', 2026)).toBe(7000);
  });
  it('applies historical overrides', () => {
    expect(capFor('sports', 2023)).toBe(500);
    expect(capFor('edu_med_ins', 2024)).toBe(3000);
    expect(capFor('housing', 2023)).toBe(0); // relief did not exist yet
    expect(capFor('disabled_self', 2024)).toBe(6000);
  });
  it('child relief has no overall cap', () => {
    expect(capFor('child', 2026)).toBe(Infinity);
  });
  it('unknown ids count zero', () => {
    expect(capFor('nonsense', 2026)).toBe(0);
  });
});

describe('medSum — medical sub-limits', () => {
  const mk = (sub: string | undefined, amount: number) => ({
    id: 'x', ya: 'YA2026', cat: 'medical', sub, date: '2026-01-01', desc: '', amount, receipt: null,
  });
  it('caps each sub-limit independently, general is uncapped', () => {
    expect(medSum([mk('checkup', 2000), mk('dental', 400), mk('general', 5000)])).toBe(1000 + 400 + 5000);
  });
  it('missing sub counts as general', () => {
    expect(medSum([mk(undefined, 3000)])).toBe(3000);
  });
});

describe('calc — demo dataset matches the shipped app', () => {
  const d = demoData();

  it('YA2026: reliefs RM13,826 · net tax RM7,419 · RM1,019 balance payable · Form BE', () => {
    const c = calc(d, 'YA2026');
    expect(c.totalAllowed).toBe(13826);
    expect(c.taxNet).toBe(7419);
    expect(c.balance).toBe(1019);
    expect(c.formType).toBe('BE');
    expect(c.donCap).toBe(Math.round(c.totalIncome * 0.1));
  });

  it('YA2025: reliefs RM23,034 · net tax RM6,259 · RM1,445 refund', () => {
    const c = calc(d, 'YA2025');
    expect(c.totalAllowed).toBe(23034);
    expect(c.taxNet).toBe(6259);
    expect(c.balance).toBe(-1445);
  });

  it('caps are enforced per category (YA2024 lifestyle at RM2,500)', () => {
    const c = calc(d, 'YA2024');
    // demo claims RM2,500 lifestyle exactly at cap; EPF RM4,000 at cap
    expect(c.totalAllowed).toBe(19340);
  });
});

describe('calc — rebates, zakat, donations', () => {
  const base = (): Data => ({
    profile: { name: 't', taxNo: '', bank: '', marital: 'single' },
    ya: 'YA2026',
    income: { YA2026: blankInc() },
    claims: [],
    receipts: [],
    docs: [],
    status: { YA2026: { stage: 'tracking' } },
  });

  it('RM400 individual rebate when chargeable ≤ RM35,000', () => {
    const d = base();
    d.income.YA2026 = { ...blankInc(), salary: 40000 }; // chargeable 31,000
    const c = calc(d, 'YA2026');
    expect(c.chargeable).toBe(31000);
    expect(c.rebate).toBe(400);
    expect(c.taxNet).toBe(taxOn(31000) - 400);
  });

  it('no rebate above the threshold', () => {
    const d = base();
    d.income.YA2026 = { ...blankInc(), salary: 60000 };
    expect(calc(d, 'YA2026').rebate).toBe(0);
  });

  it('zakat offsets tax but never below zero', () => {
    const d = base();
    d.income.YA2026 = { ...blankInc(), salary: 60000, zakat: 99999 };
    const c = calc(d, 'YA2026');
    expect(c.taxNet).toBe(0);
    expect(c.zakatRebate).toBe(c.taxGross - c.rebate);
  });

  it('donations capped at 10% of aggregate income', () => {
    const d = base();
    d.income.YA2026 = { ...blankInc(), salary: 50000 };
    d.claims.push({ id: 'd1', ya: 'YA2026', cat: 'donation', date: '2026-01-01', desc: '', amount: 20000, receipt: null });
    const c = calc(d, 'YA2026');
    expect(c.donCap).toBe(5000);
    expect(c.donAllowed).toBe(5000);
  });

  it('net rental never goes negative', () => {
    const d = base();
    d.income.YA2026 = { ...blankInc(), rent: 1000, rentExp: 5000 };
    expect(calc(d, 'YA2026').netRent).toBe(0);
  });

  it('business income flips the form to B', () => {
    const d = base();
    d.income.YA2026 = { ...blankInc(), biz: 1 };
    expect(calc(d, 'YA2026').formType).toBe('B');
  });
});

describe('jointComparison', () => {
  it('separate = mine + spouse tax (with spouse rebate); joint adds RM4,000 spouse relief', () => {
    const d = demoData();
    d.income.YA2026 = { ...blankInc(), ...d.income.YA2026, spInc: 30000, spRel: 9000 };
    const c = calc(d, 'YA2026');
    const { sep, joint } = jointComparison(c);
    // spouse: chargeable 21,000 → tax 180 → rebate 180 → 0
    expect(sep).toBe(c.taxNet + 0);
    const jCh = c.totalIncome + 30000 - c.donAllowed - c.reliefsNonDon - 4000;
    expect(joint).toBe(taxOn(jCh));
  });
});

describe('parseImport', () => {
  it('accepts a valid export and repairs a stale selected YA', () => {
    const d = demoData();
    d.ya = 'YA1999';
    const r = parseImport(JSON.stringify(d));
    expect(r.data).toBeTruthy();
    expect(r.data!.ya).toBe(Object.keys(d.income)[0]);
  });
  it('rejects non-DuitBack JSON and garbage', () => {
    expect(parseImport('{"hello":1}').error).toBeTruthy();
    expect(parseImport('not json').error).toBeTruthy();
  });
});
