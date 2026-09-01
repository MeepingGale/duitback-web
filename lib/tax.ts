// The DuitBack tax engine — Malaysian resident individual (Form BE/B).
// Pure data + math, no DOM: everything here is unit-testable.

export interface IncomeYear {
  salary: number;
  bonus: number;
  pcb: number;
  zakat: number;
  rent: number;
  rentExp: number;
  other: number;
  cp500: number;
  biz: number;
  spInc: number;
  spRel: number;
}

export interface Claim {
  id: string;
  ya: string;
  cat: string;
  sub?: string;
  date: string;
  desc: string;
  amount: number;
  receipt: string | null;
}

export interface ReceiptItem {
  id: string;
  ya: string;
  cat: string | null;
  name: string;
  sub: string;
  thumb: string | null;
  hasFull?: boolean;
}

export interface DocItem {
  id: string;
  ya: string;
  name: string;
  kind: string;
  date: string;
}

export type Stage = 'tracking' | 'submitted' | 'processing' | 'refund';

export interface YaStatus {
  stage: Stage;
  drafted?: string;
  submitted?: string;
  processing?: string;
  refunded?: string;
  ack?: string;
}

export interface Profile {
  name: string;
  taxNo: string;
  bank: string;
  marital: 'single' | 'married';
  pin?: string;
}

export interface Data {
  demo?: boolean;
  profile: Profile;
  ya: string;
  income: Record<string, Partial<IncomeYear>>;
  claims: Claim[];
  receipts: ReceiptItem[];
  docs: DocItem[];
  status: Record<string, YaStatus>;
}

export interface Cat {
  id: string;
  en: string;
  bm: string;
  cap: number | null;
  auto?: boolean;
  note: string;
}

export const CATS: Cat[] = [
  { id: 'individual', en: 'Individual & dependents', bm: 'Individu', cap: 9000, auto: true, note: 'Automatic RM9,000 for every resident taxpayer — no receipts needed.' },
  { id: 'medical', en: 'Medical — self, spouse, child', bm: 'Perubatan', cap: 10000, note: 'Shared RM10,000 ceiling with enforced sub-limits: check-up RM1,000, vaccination RM1,000, dental RM1,000, learning disability RM6,000.' },
  { id: 'parents_med', en: 'Parents — medical, care & exam', bm: 'Perubatan ibu bapa', cap: 8000, note: 'Medical treatment, special needs, carer expenses; includes grandparents from YA2025. Exam sub-limit RM1,000.' },
  { id: 'lifestyle', en: 'Lifestyle', bm: 'Gaya hidup', cap: 2500, note: 'Books, personal computer/phone/tablet, internet bill, self-improvement courses.' },
  { id: 'sports', en: 'Sports — additional', bm: 'Sukan tambahan', cap: 1000, note: 'Sports equipment, facility rental, competition fees, gym; includes parents from YA2025.' },
  { id: 'epf', en: 'EPF & approved schemes', bm: 'KWSP', cap: 4000, note: 'Employee statutory + voluntary contributions.' },
  { id: 'socso', en: 'SOCSO / EIS', bm: 'PERKESO', cap: 350, note: 'Statutory contributions per EA form.' },
  { id: 'life_ins', en: 'Life insurance / takaful', bm: 'Insurans nyawa', cap: 3000, note: 'Premiums for self or spouse.' },
  { id: 'edu_med_ins', en: 'Education & medical insurance', bm: 'Insurans pendidikan/perubatan', cap: 4000, note: 'Raised to RM4,000 from YA2025.' },
  { id: 'prs', en: 'PRS & deferred annuity', bm: 'Skim persaraan swasta', cap: 3000, note: 'Extended until YA2030.' },
  { id: 'edu_self', en: 'Education fees — self', bm: 'Yuran pendidikan', cap: 7000, note: 'Degree & above, or law/accounting/technical; upskilling courses sub-limit RM2,000.' },
  { id: 'sspn', en: 'SSPN net savings', bm: 'Simpanan SSPN', cap: 8000, note: 'Net deposit for children’s education savings.' },
  { id: 'childcare', en: 'Childcare fees (child ≤ 6)', bm: 'Taska / tadika', cap: 3000, note: 'Registered childcare centre or kindergarten.' },
  { id: 'breastfeed', en: 'Breastfeeding equipment', bm: 'Peralatan penyusuan', cap: 1000, note: 'Child ≤ 2 years; claimable once every 2 years.' },
  { id: 'spouse', en: 'Spouse / alimony', bm: 'Suami / isteri', cap: 4000, note: 'Spouse with no income, or alimony paid.' },
  { id: 'child', en: 'Child relief', bm: 'Anak', cap: null, note: 'No overall cap — fixed amount per child; add one line per child. RM2,000 under 18; RM8,000 in diploma/degree; disabled RM8,000 (+RM8,000 if studying).' },
  { id: 'disabled_self', en: 'Disabled individual', bm: 'Individu OKU', cap: 7000, note: 'Raised to RM7,000 from YA2025.' },
  { id: 'disabled_spouse', en: 'Disabled spouse', bm: 'Pasangan OKU', cap: 6000, note: 'Raised to RM6,000 from YA2025.' },
  { id: 'equip', en: 'Disabled supporting equipment', bm: 'Peralatan OKU', cap: 6000, note: 'Basic supporting equipment for self or disabled dependents.' },
  { id: 'ev', en: 'EV charging / composting', bm: 'Pengecas EV / kompos', cap: 2500, note: 'EV charger install/rental/subscription or food-waste composter; until YA2027.' },
  { id: 'housing', en: 'Housing loan interest — first home', bm: 'Faedah pinjaman rumah', cap: 7000, note: 'New YA2025–2027: RM7,000 if home ≤ RM500k; RM5,000 if RM500k–750k. SPA signed 2025–2027.' },
  { id: 'donation', en: 'Donations & gifts', bm: 'Derma', cap: null, note: 'Approved institutions — capped at 10% of aggregate income.' },
];

export const MEDSUB = [
  { id: 'general', label: 'General treatment / serious illness / fertility', cap: null as number | null },
  { id: 'checkup', label: 'Full check-up / mental health exam — max RM1,000', cap: 1000 },
  { id: 'vax', label: 'Vaccination — max RM1,000', cap: 1000 },
  { id: 'dental', label: 'Dental exam & treatment — max RM1,000', cap: 1000 },
  { id: 'learning', label: 'Learning disability, child ≤18 — max RM6,000', cap: 6000 },
];

// historical caps where they differed (approximate)
export const OVERRIDES: Record<number, Record<string, number>> = {
  2023: { sports: 500, edu_med_ins: 3000, disabled_self: 6000, disabled_spouse: 5000, housing: 0 },
  2024: { edu_med_ins: 3000, disabled_self: 6000, disabled_spouse: 5000, housing: 0 },
};

export const CHILDSUB = [
  { id: 'u18', label: 'Under 18 — RM2,000 each', amt: 2000 },
  { id: 'a18pre', label: '18+ in A-Level / matric / foundation — RM2,000', amt: 2000 },
  { id: 'a18edu', label: '18+ in diploma / degree & above — RM8,000', amt: 8000 },
  { id: 'dis', label: 'Disabled child — RM8,000', amt: 8000 },
  { id: 'disedu', label: 'Disabled child in tertiary study — RM16,000', amt: 16000 },
];

// YA2025 resident scale
export const BRACKETS: Array<[number, number]> = [
  [5000, 0], [20000, 0.01], [35000, 0.03], [50000, 0.06], [70000, 0.11],
  [100000, 0.19], [400000, 0.25], [600000, 0.26], [2000000, 0.28], [Infinity, 0.30],
];

export function capFor(id: string, yaNum: number): number {
  if (id === 'child') return Infinity;
  const o = OVERRIDES[yaNum];
  if (o && id in o) return o[id];
  const ct = CATS.find((c) => c.id === id);
  return ct && ct.cap ? ct.cap : 0;
}

export function taxOn(ci: number): number {
  let t = 0, p = 0;
  for (const [u, r] of BRACKETS) {
    if (ci <= p) break;
    t += (Math.min(ci, u) - p) * r;
    p = u;
  }
  return Math.max(0, Math.round(t));
}

export function fmt(n: number): string {
  return 'RM ' + Math.round(n).toLocaleString('en-MY');
}

// Malaysian individual TIN: "IG" + 9–11 digits since 2 Jan 2023 (legacy
// numbers used SG/OG). Validation is advisory only — never block the field.
export const TIN_RE = /^(IG|SG|OG)\s?\d{9,12}$/i;

export function looksLikeTin(s: string): boolean {
  const t = s.trim();
  return t === '' || TIN_RE.test(t);
}

export type TinPrefix = 'IG' | 'SG' | 'OG';

/** Split any stored/typed TIN into its prefix and up-to-11 digits. */
export function parseTin(raw: string): { prefix: TinPrefix; digits: string } {
  const m = raw.trim().toUpperCase().match(/^(IG|SG|OG)/);
  return { prefix: (m?.[1] as TinPrefix) || 'IG', digits: raw.replace(/\D/g, '').slice(0, 11) };
}

/** Canonical stored form: prefix + digits, or empty when no digits (optional field). */
export function composeTin(prefix: TinPrefix, digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 11);
  return d ? prefix + d : '';
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function blankInc(): IncomeYear {
  return { salary: 0, bonus: 0, pcb: 0, zakat: 0, rent: 0, rentExp: 0, other: 0, cp500: 0, biz: 0, spInc: 0, spRel: 9000 };
}

// sub-limit-aware medical total
export function medSum(claims: Claim[]): number {
  const bySub: Record<string, number> = {};
  claims.forEach((c) => {
    const s = c.sub || 'general';
    bySub[s] = (bySub[s] || 0) + (+c.amount || 0);
  });
  let t = 0;
  MEDSUB.forEach((m) => {
    const v = bySub[m.id] || 0;
    t += m.cap ? Math.min(v, m.cap) : v;
  });
  return t;
}

export interface CalcResult {
  claims: Claim[];
  inc: IncomeYear;
  sums: Record<string, number>;
  netRent: number;
  totalIncome: number;
  donRaw: number;
  donCap: number;
  donAllowed: number;
  reliefsNonDon: number;
  totalAllowed: number;
  chargeable: number;
  taxGross: number;
  rebate: number;
  zakatRebate: number;
  taxNet: number;
  paid: number;
  balance: number;
  formType: 'B' | 'BE';
}

export function calc(d: Data, ya: string): CalcResult {
  const yaNum = +ya.slice(2);
  const claims = d.claims.filter((c) => c.ya === ya);
  const inc = Object.assign(blankInc(), d.income[ya] || {});
  const netRent = Math.max(0, (+inc.rent || 0) - (+inc.rentExp || 0));
  const totalIncome = (+inc.salary || 0) + (+inc.bonus || 0) + netRent + (+inc.other || 0) + (+inc.biz || 0);
  const sums: Record<string, number> = {};
  claims.forEach((c) => {
    if (c.cat !== 'medical') sums[c.cat] = (sums[c.cat] || 0) + (+c.amount || 0);
  });
  const medClaims = claims.filter((c) => c.cat === 'medical');
  if (medClaims.length) sums.medical = medSum(medClaims);
  const donRaw = sums.donation || 0;
  const donCap = Math.round(totalIncome * 0.10);
  const donAllowed = Math.min(donRaw, donCap);
  let reliefsNonDon = 9000;
  CATS.forEach((ct) => {
    if (ct.id === 'donation' || ct.id === 'individual') return;
    const cl = sums[ct.id] || 0;
    const cp = capFor(ct.id, yaNum);
    reliefsNonDon += cp === Infinity ? cl : Math.min(cl, cp);
  });
  const chargeable = Math.max(0, totalIncome - donAllowed - reliefsNonDon);
  const taxGross = taxOn(chargeable);
  const rebate = chargeable <= 35000 ? Math.min(400, taxGross) : 0;
  const zakatRebate = Math.min(+inc.zakat || 0, Math.max(0, taxGross - rebate));
  const taxNet = Math.max(0, taxGross - rebate - zakatRebate);
  const paid = (+inc.pcb || 0) + (+inc.cp500 || 0);
  const balance = taxNet - paid;
  return {
    claims, inc, sums, netRent, totalIncome, donRaw, donCap, donAllowed, reliefsNonDon,
    totalAllowed: reliefsNonDon + donAllowed, chargeable, taxGross, rebate, zakatRebate,
    taxNet, paid, balance, formType: (+inc.biz || 0) > 0 ? 'B' : 'BE',
  };
}

// spouse-side and joint-assessment comparison (married filers)
export function jointComparison(c: CalcResult) {
  const spInc = +c.inc.spInc || 0;
  const spRel = +c.inc.spRel || 0;
  const spCh = Math.max(0, spInc - spRel);
  const spTaxG = taxOn(spCh);
  const spTax = Math.max(0, spTaxG - (spCh <= 35000 ? Math.min(400, spTaxG) : 0));
  const sep = c.taxNet + spTax;
  const jCh = Math.max(0, c.totalIncome + spInc - c.donAllowed - c.reliefsNonDon - 4000);
  const jG = taxOn(jCh);
  const jReb = jCh <= 35000 ? Math.min(800, jG) : 0;
  const joint = Math.max(0, jG - jReb - c.zakatRebate);
  return { sep, joint };
}
