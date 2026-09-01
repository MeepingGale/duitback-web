// LHDN computerised MTD (PCB) estimator — implements the "Specification for
// MTD Calculations Using Computerised Calculation Method" (Kaedah Pengiraan
// Berkomputer, hasil.gov.my). Steady-state assumptions for the estimate:
// equal monthly salary Jan–Dec, the whole bonus paid in December, employee
// EPF at 11% (qualifying amount capped at RM4,000/year), no TP1 deductions,
// no zakat through payroll, not disabled. Category and children follow the
// spec: 1 = single (C = 0) · 2 = married, spouse not working (S counts) ·
// 3 = married, spouse working (S = 0).

import { BRACKETS } from './tax';

export type PcbCategory = 1 | 2 | 3;

export interface PcbInput {
  salary: number; // annual normal remuneration
  bonus: number; // additional remuneration, paid once in December
  category: PcbCategory;
  children: number; // qualifying children (C) — ignored for category 1
  epfRate?: number; // employee share, default 11%
}

export interface PcbEstimate {
  total: number; // PCB withheld for the whole year
  monthly: number; // January's deduction (steady months are within sen of this)
  december: number; // December's deduction incl. the bonus portion
}

const D = 9000; // individual deduction
const S = 4000; // husband/wife deduction (category 2 only)
const Q = 2000; // per qualifying child
const EPF_QUALIFYING = 4000; // EPF/approved-scheme cap for K per year

/** Truncate to two decimals — the spec keeps two decimal points and omits the rest. */
const trunc2 = (v: number) => Math.trunc(v * 100 + (v >= 0 ? 1e-7 : -1e-7)) / 100;

/** MTD amounts round UP to the nearest five sen (1–4 → 5, 6–9 → 10). */
const ceil5sen = (v: number) => {
  const c = Math.round(trunc2(v) * 100);
  const r = c % 5;
  return (r ? c + 5 - r : c) / 100;
};

/** (P − M)R + B from Table 1: the exact scale tax minus the RM400/RM800
 *  rebate the B column embeds for chargeable income of RM35,000 and below. */
export function taxForYearPcb(P: number, category: PcbCategory): number {
  if (P <= 5000) return 0;
  let t = 0, prev = 0;
  for (const [upper, rate] of BRACKETS) {
    if (P <= prev) break;
    t += (Math.min(P, upper) - prev) * rate;
    prev = upper;
  }
  return t - (P <= 35000 ? (category === 2 ? 800 : 400) : 0);
}

/** One MTD amount: truncated, rounded up to 5 sen, zeroed under the RM10 floor. */
const finishMtd = (raw: number) => {
  if (raw <= 0) return 0;
  const v = ceil5sen(raw);
  return v < 10 ? 0 : v;
};

export function estimatePcb({ salary, bonus, category, children, epfRate = 0.11 }: PcbInput): PcbEstimate {
  const ded = D + (category === 2 ? S : 0) + (category === 1 ? 0 : Q * Math.max(0, children));
  const y1 = salary / 12;
  let accNet = 0; // Σ(Y − K*): net remuneration paid before the current month
  let accK = 0; // EPF claimed against the qualifying amount so far
  let X = 0; // accumulated MTD paid
  let monthly = 0, december = 0;

  for (let m = 1; m <= 12; m++) {
    const n = 12 - m; // remaining months after this one
    const K1 = Math.min(trunc2(y1 * epfRate), EPF_QUALIFYING - accK);
    const isDec = m === 12;
    const Yt = isDec ? bonus : 0;
    const Kt = Yt ? Math.min(trunc2(Yt * epfRate), EPF_QUALIFYING - accK - K1) : 0;
    const K2 = n > 0 ? Math.min(trunc2((EPF_QUALIFYING - (accK + K1 + Kt)) / n), K1) : 0;

    // Step 1 — MTD on net normal remuneration
    const P1 = trunc2(accNet + (y1 - K1) + (y1 - K2) * n - ded);
    const tax1 = trunc2(taxForYearPcb(P1, category));
    const mtdNormal = finishMtd((tax1 - X) / (n + 1));

    let monthMtd = mtdNormal;
    if (Yt > 0) {
      // Steps 2–5 — MTD on the additional remuneration (bonus)
      const totalForYear = X + mtdNormal * (n + 1); // Step 1[E]
      const Pfull = trunc2(accNet + (y1 - K1) + (y1 - K2) * n + (Yt - Kt) - ded);
      const tax3 = trunc2(taxForYearPcb(Pfull, category));
      monthMtd = mtdNormal + finishMtd(tax3 - totalForYear);
    }

    if (m === 1) monthly = monthMtd;
    if (isDec) december = monthMtd;
    X = trunc2(X + monthMtd);
    accNet = trunc2(accNet + (y1 - K1) + (Yt - Kt));
    accK = trunc2(accK + K1 + Kt);
  }

  return { total: X, monthly, december };
}
