import { describe, expect, it } from 'vitest';
import { estimatePcb, taxForYearPcb } from './pcb';

// The spec's Table 1 B column equals the YA2025 scale tax minus the embedded
// RM400 (cat 1/3) or RM800 (cat 2) rebate at each bracket floor.
describe('taxForYearPcb', () => {
  it('matches Table 1 at the bracket floors', () => {
    expect(taxForYearPcb(20000, 1)).toBeCloseTo(150 - 400, 2); // B = −250 at next floor
    expect(taxForYearPcb(35000, 1)).toBeCloseTo(200, 2); // 600 − 400
    expect(taxForYearPcb(35000, 2)).toBeCloseTo(-200, 2); // 600 − 800
    expect(taxForYearPcb(35001, 1)).toBeCloseTo(600.06, 2); // rebate gone above 35k
    expect(taxForYearPcb(50000, 1)).toBeCloseTo(1500, 2);
    expect(taxForYearPcb(70000, 1)).toBeCloseTo(3700, 2);
    expect(taxForYearPcb(100000, 1)).toBeCloseTo(9400, 2);
    expect(taxForYearPcb(400000, 1)).toBeCloseTo(84400, 2);
    expect(taxForYearPcb(5000, 1)).toBe(0);
  });
});

describe('estimatePcb — LHDN computerised MTD', () => {
  it('single, RM60k salary: steady RM110/month, year total converges to the annual tax', () => {
    const e = estimatePcb({ salary: 60000, bonus: 0, category: 1, children: 0 });
    // P ≈ 60,000 − 4,000 EPF − 9,000 individual = 47,000 → tax RM1,320
    expect(e.monthly).toBe(110);
    expect(Math.abs(e.total - 1320)).toBeLessThan(2);
  });

  it('rounds each month up to the nearest 5 sen', () => {
    const e = estimatePcb({ salary: 65000, bonus: 0, category: 1, children: 0 });
    // 1,720 / 12 = 143.333… → truncate 143.33 → round up to 143.35
    expect(e.monthly).toBe(143.35);
    expect(Math.round(e.monthly * 100) % 5).toBe(0);
  });

  it('applies the RM10 floor monthly, but the formula self-corrects late in the year', () => {
    // P = 42,000 − 4,000 − 9,000 = 29,000 → tax RM20 → RM1.67/month < RM10 → skipped…
    const e = estimatePcb({ salary: 42000, bonus: 0, category: 1, children: 0 });
    expect(e.monthly).toBe(0);
    // …until December, where (tax − X)/1 = RM20 ≥ RM10 and the liability lands
    expect(e.total).toBe(20);
    // a low salary with negative scale tax stays zero all year
    expect(estimatePcb({ salary: 30000, bonus: 0, category: 1, children: 0 }).total).toBe(0);
  });

  it('bonus December: RM100k + RM50k single reaches the full-year tax on RM137k chargeable', () => {
    const e = estimatePcb({ salary: 100000, bonus: 50000, category: 1, children: 0 });
    // P = 150,000 − 4,000 − 9,000 = 137,000 → tax 9,400 + 25% × 37,000 = 18,650
    expect(Math.abs(e.total - 18650)).toBeLessThan(3);
    expect(e.december).toBeGreaterThan(e.monthly); // bonus month carries the extra deduction
    expect(Math.abs(e.total - (e.monthly * 11 + e.december))).toBeLessThan(1); // steady months
  });

  it('category 2 with children: spouse and child deductions reduce the deduction', () => {
    const e = estimatePcb({ salary: 80000, bonus: 0, category: 2, children: 2 });
    // P = 80,000 − 4,000 − 9,000 − 4,000 − 2×2,000 = 59,000 → tax 2,490
    expect(e.monthly).toBe(207.5);
    expect(Math.abs(e.total - 2490)).toBeLessThan(2);
    // category 3 ignores S but keeps children
    const e3 = estimatePcb({ salary: 80000, bonus: 0, category: 3, children: 2 });
    expect(e3.total).toBeGreaterThan(e.total);
  });

  it('bonus-only December still withholds (Y1 continues, additional MTD on top)', () => {
    const e = estimatePcb({ salary: 0, bonus: 60000, category: 1, children: 0 });
    // P = 60,000 − 4,000 − 9,000 = 47,000 → tax RM1,320, all deducted in December
    expect(e.monthly).toBe(0);
    expect(Math.abs(e.december - 1320)).toBeLessThan(2);
  });
});
