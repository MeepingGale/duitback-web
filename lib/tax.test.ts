import { describe, expect, it } from 'vitest';
import { blankInc, calc, capFor, clamp2dpStr, compensationExempt, composeTin, Data, derivedReliefs, fmt, fmtAmountStr, jointComparison, looksLikeTin, medSubCap, medSum, parseTin, subSum, taxOn, to2dp } from './tax';
import { demoData, parseImport, pruneEmptyFutureYears } from './data';

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
    expect(medSum([mk('checkup', 2000), mk('dental', 400), mk('general', 5000)], 2026)).toBe(1000 + 400 + 5000);
  });
  it('missing sub counts as general', () => {
    expect(medSum([mk(undefined, 3000)], 2026)).toBe(3000);
  });

  it('learning-disability sub-limit follows the year: RM4k (2023) → RM6k (2024–25) → RM10k (2026, Budget 2026)', () => {
    expect(medSubCap('learning', 2023)).toBe(4000);
    expect(medSubCap('learning', 2025)).toBe(6000);
    expect(medSubCap('learning', 2026)).toBe(10000);
    expect(medSum([mk('learning', 9000)], 2025)).toBe(6000);
    expect(medSum([mk('learning', 9000)], 2026)).toBe(9000);
  });

  it('domestic tourism relief exists for YA2026 only', () => {
    expect(capFor('tourism', 2026)).toBe(1000);
    expect(capFor('tourism', 2025)).toBe(0);
    expect(capFor('tourism', 2027)).toBe(0);
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

describe('looksLikeTin — advisory Malaysian TIN check', () => {
  it.each([
    ['', true], // optional field
    ['IG845462070', true],
    ['IG57303584070', true],
    ['ig845462070', true], // case-insensitive
    ['IG 845462070', true], // space after prefix
    ['SG10234567890', true], // legacy prefix
    ['OG12345678901', true],
    ['IG12345', false], // too short
    ['C20880050010', false], // company TIN, not an individual
    ['990101-14-5678', false], // that is a MyKad number
  ])('%s → %s', (input, ok) => {
    expect(looksLikeTin(input)).toBe(ok);
  });
});

describe('money display formatting', () => {
  it('fmt keeps sen when present, plain thousands otherwise', () => {
    expect(fmt(1000)).toBe('RM 1,000');
    expect(fmt(89.9)).toBe('RM 89.90');
    expect(fmt(1000000.01)).toBe('RM 1,000,000.01');
    expect(fmt(123.456)).toBe('RM 123.46');
  });
  it('fmtAmountStr groups typed values on blur', () => {
    expect(fmtAmountStr('1000')).toBe('1,000');
    expect(fmtAmountStr('1000.5')).toBe('1,000.50');
    expect(fmtAmountStr('')).toBe('');
  });
  it('clamp2dpStr drops stray leading zeros', () => {
    expect(clamp2dpStr('0200')).toBe('200');
    expect(clamp2dpStr('0.50')).toBe('0.50');
    expect(clamp2dpStr('000')).toBe('0');
  });
});

describe('two-decimal money enforcement', () => {
  it('to2dp rounds to sen', () => {
    expect(to2dp(123.456)).toBe(123.46);
    expect(to2dp(0.005)).toBe(0.01);
    expect(to2dp(100)).toBe(100);
  });
  it('clamp2dpStr limits typed amounts to two decimals and strips junk', () => {
    expect(clamp2dpStr('123.456')).toBe('123.45');
    expect(clamp2dpStr('12.3')).toBe('12.3');
    expect(clamp2dpStr('1e5')).toBe('15');
    expect(clamp2dpStr('abc')).toBe('');
    expect(clamp2dpStr('88.90')).toBe('88.90');
  });
});

describe('parseTin / composeTin — the format-enforcing input', () => {
  it('splits stored values into prefix + digits, stripping noise', () => {
    expect(parseTin('IG845462070')).toEqual({ prefix: 'IG', digits: '845462070' });
    expect(parseTin('SG 1234567-08')).toEqual({ prefix: 'SG', digits: '123456708' });
    expect(parseTin('og 12345678901')).toEqual({ prefix: 'OG', digits: '12345678901' });
    expect(parseTin('')).toEqual({ prefix: 'IG', digits: '' });
  });
  it('caps digits at 11 and drops every non-digit', () => {
    expect(parseTin('IG 8454-62070abc99999').digits).toBe('84546207099');
    expect(composeTin('IG', '845462070abc')).toBe('IG845462070');
  });
  it('composes empty when there are no digits — the field is optional', () => {
    expect(composeTin('IG', '')).toBe('');
    expect(composeTin('SG', ' - ')).toBe('');
  });
});

describe('pruneEmptyFutureYears', () => {
  it('removes empty scaffolds beyond the current calendar year and repairs the selection', () => {
    const d = demoData();
    d.income.YA2031 = blankInc();
    d.status.YA2031 = { stage: 'tracking' };
    d.income.YA2032 = blankInc();
    d.status.YA2032 = { stage: 'tracking' };
    d.ya = 'YA2032';
    expect(pruneEmptyFutureYears(d, 2026)).toBe(true);
    expect(d.income.YA2031).toBeUndefined();
    expect(d.income.YA2032).toBeUndefined();
    expect(d.ya).toBe('YA2026');
  });

  it('never touches a future year that holds user data, or any past year', () => {
    const d = demoData();
    d.income.YA2027 = { ...blankInc(), salary: 1000 };
    d.status.YA2027 = { stage: 'tracking' };
    expect(pruneEmptyFutureYears(d, 2026)).toBe(false);
    expect(d.income.YA2027).toBeTruthy();
    expect(d.income.YA2023).toBeTruthy();
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


describe('YA2025+ rules added from the LHDN relief, rebate and dividend pages', () => {
  const base = (): Data => ({ profile: { name: 'T', taxNo: '', bank: '', marital: 'single' }, ya: 'YA2026', income: { YA2026: { ...blankInc(), salary: 90000 } }, claims: [], receipts: [], docs: [], status: {} });

  it('derives disabled, spouse and child reliefs from the profile — only where no claim lines exist', () => {
    const d = base();
    d.profile = { ...d.profile, marital: 'married', disabled: true, spouseWorking: false, spouseDisabled: true, children: { u18: 2, a18pre: 0, a18edu: 1, dis: 0, disedu: 0 } };
    expect(derivedReliefs(d.profile, 2026)).toEqual({ disabled_self: 7000, spouse: 4000, disabled_spouse: 6000, child: 12000 });
    expect(derivedReliefs(d.profile, 2024).disabled_self).toBe(6000); // historical cap
    const c = calc(d, 'YA2026');
    expect(c.derived).toEqual({ disabled_self: 7000, spouse: 4000, disabled_spouse: 6000, child: 12000 });
    expect(c.reliefsNonDon).toBe(9000 + 7000 + 4000 + 6000 + 12000);
    // a manual child line takes precedence over the profile count for that category
    d.claims.push({ id: 'k', ya: 'YA2026', cat: 'child', date: '2026-01-01', desc: 'one child', amount: 2000, receipt: null });
    const c2 = calc(d, 'YA2026');
    expect(c2.derived.child).toBeUndefined();
    expect(c2.sums.child).toBe(2000);
    // spouse reliefs need a spouse without income; disabled-spouse rides on the spouse relief
    d.profile.spouseWorking = true;
    expect(derivedReliefs(d.profile, 2026)).toEqual({ disabled_self: 7000, child: 12000 });
    // both earning and splitting child relief 50/50
    d.profile.childShare = 50;
    expect(derivedReliefs(d.profile, 2026).child).toBe(6000);
    // the split only exists when the spouse has income
    d.profile.spouseWorking = false;
    expect(derivedReliefs(d.profile, 2026).child).toBe(12000);
  });

  it('joint-vs-separate does not double count a spouse relief that is already in the separate figure', () => {
    const d = base();
    d.profile = { ...d.profile, marital: 'married', spouseWorking: false };
    const c = calc(d, 'YA2026');
    expect(c.derived.spouse).toBe(4000);
    expect(c.chargeable).toBe(90000 - 9000 - 4000);
    const jc = jointComparison(c);
    // spouse has no income: joint and separate see the same RM77,000 chargeable → same tax
    expect(jc.joint).toBe(jc.sep);
    expect(jc.sep).toBe(taxOn(77000));
    // spouse income entered on the Income screen switches the spouse reliefs off, whatever the profile says
    d.profile.spouseDisabled = true;
    d.income.YA2026 = { ...blankInc(), salary: 90000, spInc: 50000 };
    const c2 = calc(d, 'YA2026');
    expect(c2.derived.spouse).toBeUndefined();
    expect(c2.derived.disabled_spouse).toBeUndefined();
    expect(c2.chargeable).toBe(90000 - 9000);
  });

  it('exempts RM10,000 of loss-of-employment compensation per completed year (all of it on ill health)', () => {
    expect(compensationExempt(45000, 3.8)).toBe(30000);
    expect(compensationExempt(25000, 4)).toBe(25000);
    expect(compensationExempt(45000, 1, true)).toBe(45000);
    const d = base();
    d.income.YA2026 = { ...blankInc(), salary: 90000, compensation: 45000, serviceYears: 3 };
    const c = calc(d, 'YA2026');
    expect(c.compExempt).toBe(30000);
    expect(c.compTaxable).toBe(15000);
    expect(c.totalIncome).toBe(105000);
  });

  it('taxes the dividend share of chargeable income at 2% above RM100,000 instead of the scale', () => {
    const d = base();
    d.income.YA2026 = { ...blankInc(), salary: 200000, dividends: 150000 };
    const c = calc(d, 'YA2026');
    // aggregate 350,000 − 9,000 = 341,000 chargeable; dividend share = 341,000 × 150/350
    expect(c.chargeable).toBe(341000);
    expect(c.chargeableDiv).toBeCloseTo(146142.86, 2);
    expect(c.dividendTax).toBeCloseTo(922.86, 2);
    expect(c.taxGross).toBe(Math.round(taxOn(341000 - 146142.86) + 922.86));
    // dividends within the threshold add nothing
    d.income.YA2026 = { ...blankInc(), salary: 90000, dividends: 50000 };
    const c2 = calc(d, 'YA2026');
    expect(c2.dividendTax).toBe(0);
    expect(c2.taxGross).toBe(taxOn(c2.chargeable - c2.chargeableDiv));
  });

  it('enforces the education, parents-medical and housing sub-limits', () => {
    const mk = (cat: string, sub: string | undefined, amount: number) => ({ id: cat + sub + amount, ya: 'YA2026', cat, sub, date: '2026-01-01', desc: '', amount, receipt: null });
    expect(subSum('edu_self', [mk('edu_self', 'upskill', 3000), mk('edu_self', 'degree', 2000)], 2026)).toBe(2000 + 2000);
    expect(subSum('parents_med', [mk('parents_med', 'exam', 1500), mk('parents_med', undefined, 3000)], 2026)).toBe(1000 + 3000);
    expect(subSum('housing', [mk('housing', 'gt500', 7000)], 2026)).toBe(5000);
    const d = base();
    d.claims.push(mk('housing', 'gt500', 7000), mk('edu_self', 'upskill', 3000));
    const c = calc(d, 'YA2026');
    expect(c.sums.housing).toBe(5000);
    expect(c.sums.edu_self).toBe(2000);
  });

  it('applies the departure levy rebate after the individual rebate, capped by tax', () => {
    const d = base();
    d.income.YA2026 = { ...blankInc(), salary: 90000, levyRebate: 150, zakat: 100 };
    const c = calc(d, 'YA2026');
    expect(c.levyRebate).toBe(150);
    expect(c.taxNet).toBe(c.taxGross - 150 - 100);
  });
});
