// The DuitBack tax engine — Malaysian resident individual (Form BE/B).
// Pure data + math, no DOM: everything here is unit-testable.

export interface IncomeYear {
  salary: number;
  bonus: number;
  pcb: number;
  /** pcb is auto-estimated from salary/bonus (cleared when the user types their own figure) */
  pcbAuto?: boolean;
  zakat: number;
  rent: number;
  rentExp: number;
  other: number;
  cp500: number;
  biz: number;
  spInc: number;
  spRel: number;
  /** Malaysian single-tier dividends — 2% on the chargeable portion above RM100,000 from YA2025 */
  dividends: number;
  /** compensation for loss of employment; RM10,000 exempt per completed year (ITA Sch 6 para 15) */
  compensation: number;
  serviceYears: number;
  compIllHealth?: boolean;
  /** departure levy paid for umrah / religious travel — rebate, max 2 trips */
  levyRebate: number;
}

export interface ChildCounts { u18: number; a18pre: number; a18edu: number; dis: number; disedu: number }

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
  /** what kind of evidence this is — set from a MyInvois QR, the receipt reader, or the person */
  proof?: 'einvoice' | 'receipt' | 'statement';
  /** the validated e-invoice this photo carries (decoded from its MyInvois QR) */
  einv?: { uuid: string; longId: string; url: string };
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
  // statutory reliefs that need no receipts — derived from these, not from claim lines
  disabled?: boolean;
  spouseWorking?: boolean;
  spouseDisabled?: boolean;
  children?: ChildCounts;
  /** 50 when someone who is not a spouse living with you (e.g. an ex-spouse) also claims the same child — ITA s.48(4);
   *  spouses under separate assessment don't split, each enters only the children they claim */
  childShare?: 50 | 100;
  /** alimony paid to a former wife under a court order or formal agreement — counts within the RM4,000 spouse relief (s.47(2)) */
  alimony?: number;
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
  /** fixed relief counted from the profile (Settings → Family & status), not from receipts */
  profile?: boolean;
  note: string;
}

export const CATS: Cat[] = [
  { id: 'individual', en: 'Individual & dependents', bm: 'Individu', cap: 9000, auto: true, note: 'Automatic RM9,000 for every resident taxpayer — no receipts needed.' },
  { id: 'medical', en: 'Medical — self, spouse, child', bm: 'Perubatan', cap: 10000, note: 'Shared RM10,000 ceiling with enforced sub-limits: check-up RM1,000, vaccination RM1,000 (any NPRA-registered vaccine from YA2026), dental RM1,000 (from YA2024), learning disability RM10,000 (RM6,000 in YA2025, RM4,000 in YA2023–2024).' },
  { id: 'parents_med', en: 'Parents — medical, care & exam', bm: 'Perubatan ibu bapa', cap: 8000, note: 'Medical treatment, special needs, carer expenses; includes grandparents from YA2025. Exam sub-limit RM1,000.' },
  { id: 'lifestyle', en: 'Lifestyle', bm: 'Gaya hidup', cap: 2500, note: 'Books, personal computer/phone/tablet, internet bill, self-improvement courses.' },
  { id: 'sports', en: 'Sports — additional', bm: 'Sukan tambahan', cap: 1000, note: 'Sports equipment, facility rental, competition fees, gym; includes parents from YA2025.' },
  { id: 'epf', en: 'EPF & approved schemes', bm: 'KWSP', cap: 4000, note: 'Employee statutory + voluntary contributions.' },
  { id: 'socso', en: 'SOCSO / EIS', bm: 'PERKESO', cap: 350, note: 'Statutory contributions per EA form.' },
  { id: 'life_ins', en: 'Life insurance / takaful', bm: 'Insurans nyawa', cap: 3000, note: 'Premiums for self or spouse; from YA2026 also for children.' },
  { id: 'edu_med_ins', en: 'Education & medical insurance', bm: 'Insurans pendidikan/perubatan', cap: 4000, note: 'Raised to RM4,000 from YA2025. From YA2026 a covered child must be unmarried and under 18, or 18+ in full-time education or serving articles, or disabled.' },
  { id: 'prs', en: 'PRS & deferred annuity', bm: 'Skim persaraan swasta', cap: 3000, note: 'Extended until YA2030.' },
  { id: 'edu_self', en: 'Education fees — self', bm: 'Yuran pendidikan', cap: 7000, note: 'Masters/PhD in any field; below that only law, accounting, Islamic finance, technical, vocational, industrial, scientific or technological fields; JPK-recognised upskilling sub-limit RM2,000 (YA2023–2026).' },
  { id: 'sspn', en: 'SSPN net savings', bm: 'Simpanan SSPN', cap: 8000, note: 'Net deposit for children’s education savings; withdrawals for the child’s tertiary fees are not netted. Until YA2027.' },
  { id: 'childcare', en: 'Childcare fees', bm: 'Taska / tadika', cap: 3000, note: 'Taska (DSW) or kindergarten (MOE) fees for a child aged 6 or under; from YA2026 also DSW-registered daycare and after-school transit centres for a child aged 12 or under. RM3,000 total, one spouse.' },
  { id: 'breastfeed', en: 'Breastfeeding equipment', bm: 'Peralatan penyusuan', cap: 1000, note: 'Child ≤ 2 years; claimable once every 2 years.' },
  { id: 'spouse', profile: true, en: 'Spouse / alimony', bm: 'Suami / isteri', cap: 4000, note: 'Spouse with no income, or alimony paid.' },
  { id: 'child', profile: true, en: 'Child relief', bm: 'Anak', cap: null, note: 'No overall cap — fixed amount per child; add one line per child. RM2,000 under 18; RM8,000 in diploma/degree; disabled RM8,000 (+RM8,000 if studying).' },
  { id: 'disabled_self', profile: true, en: 'Disabled individual', bm: 'Individu OKU', cap: 7000, note: 'Raised to RM7,000 from YA2025.' },
  { id: 'disabled_spouse', profile: true, en: 'Disabled spouse', bm: 'Pasangan OKU', cap: 6000, note: 'Raised to RM6,000 from YA2025.' },
  { id: 'equip', en: 'Disabled supporting equipment', bm: 'Peralatan OKU', cap: 6000, note: 'Basic supporting equipment for a DSW-registered disabled self, spouse, child or parent.' },
  { id: 'ev', en: 'EV charging · CCTV · composting', bm: 'Pengecas EV / CCTV / kompos', cap: 2500, note: 'EV charger install, purchase/hire-purchase, rental or subscription (to YA2027); food-waste composter once in YA2025–27; from YA2026 also food-waste grinder or household CCTV, once in YA2026–27. RM2,500 total.' },
  { id: 'tourism', en: 'Domestic tourism', bm: 'Pelancongan domestik', cap: 1000, note: 'YA2026 only — entrance fees to tourist attractions and cultural or arts programmes in Malaysia (Visit Malaysia 2026).' },
  { id: 'housing', en: 'Housing loan interest — first home', bm: 'Faedah pinjaman rumah', cap: 7000, note: 'From YA2025. RM7,000 if price ≤ RM500k; RM5,000 if RM500,001–750k. SPA signed 1 Jan 2025–31 Dec 2027; three consecutive YAs from the first year interest is paid (may run past YA2027). Malaysian citizen and tax resident only.' },
  { id: 'donation', en: 'Donations & gifts', bm: 'Derma', cap: null, note: 'Government gifts: no limit. Approved bodies, sports, national-interest projects and wakaf: 10% of aggregate income shared. Library or medical gifts: RM20,000 each. Certified artefacts and paintings at their valuation.' },
];

/** The schedule year the current caps describe (Budget 2026 → YA2026). */
export const SCHEDULE_YA = 2026;

export const MEDSUB = [
  { id: 'general', label: 'General treatment / serious illness / fertility', cap: null as number | null },
  { id: 'checkup', label: 'Check-up, screening test, self-test device or mental health consultation', cap: 1000 },
  { id: 'vax', label: 'Vaccination — any NPRA-registered vaccine from YA2026', cap: 1000 },
  { id: 'dental', label: 'Dental exam & treatment', cap: 1000 },
  { id: 'learning', label: 'Learning disability (autism, ADHD, Down syndrome…), child ≤18', cap: 10000 },
];

// medical sub-limits that differed in earlier years
export const MEDSUB_OVERRIDES: Record<number, Record<string, number>> = {
  2023: { learning: 4000, dental: 0 }, // dental relief only exists from YA2024
  2024: { learning: 4000 },
  2025: { learning: 6000 },
};

export interface SubLimit { id: string; label: string; cap: number | null }

/** Categories whose total is made of sub-limited parts (LHDN relief list). */
export const SUBLIMITS: Record<string, SubLimit[]> = {
  medical: MEDSUB,
  edu_self: [
    { id: 'degree', label: 'Masters/PhD (any field), or up to degree level in a listed field', cap: null },
    { id: 'upskill', label: 'JPK-recognised upskilling course (YA2023–2026)', cap: 2000 },
  ],
  parents_med: [
    { id: 'care', label: 'Treatment, dental, special needs, carer expenses', cap: null },
    { id: 'exam', label: 'Full medical examination', cap: 1000 },
  ],
  housing: [
    { id: 'le500', label: 'First home priced up to RM500,000', cap: 7000 },
    { id: 'gt500', label: 'First home priced RM500,001–750,000', cap: 5000 },
  ],
  donation: [
    { id: 'approved', label: 'Approved institution, fund, sports body, national-interest project or wakaf — shared 10% pool', cap: null },
    { id: 'gov', label: 'Federal or state government, local authority — no limit', cap: null },
    { id: 'library', label: 'Library facilities — RM20,000', cap: 20000 },
    { id: 'medical', label: 'Medical equipment or MOH-approved healthcare facility — RM20,000', cap: 20000 },
    { id: 'inkind', label: 'Artefacts, manuscripts, paintings or disabled facilities at certified value — no limit', cap: null },
  ],
};
export const DEFAULT_SUB: Record<string, string> = { medical: 'general', edu_self: 'degree', parents_med: 'care', housing: 'le500', donation: 'approved' };

export function subCap(cat: string, id: string, yaNum: number): number | null {
  if (cat === 'medical') { const o = MEDSUB_OVERRIDES[yaNum]; if (o && id in o) return o[id]; }
  if (cat === 'edu_self' && id === 'upskill' && yaNum > 2026) return 0; // JPK upskilling slot runs YA2023–2026 only
  if (cat === 'parents_med' && id === 'exam' && yaNum < 2024) return 0; // parents' check-up sub-limit began YA2024
  const m = (SUBLIMITS[cat] || []).find((x) => x.id === id);
  return m ? m.cap : null;
}

export function medSubCap(id: string, yaNum: number): number | null {
  return subCap('medical', id, yaNum);
}

/** Sum of a category's claims with each sub-limit enforced. */
export function subSum(cat: string, claims: Claim[], yaNum: number): number {
  const bySub: Record<string, number> = {};
  claims.forEach((c) => {
    const s = c.sub || DEFAULT_SUB[cat] || 'general';
    bySub[s] = (bySub[s] || 0) + (+c.amount || 0);
  });
  let t = 0;
  (SUBLIMITS[cat] || []).forEach((m) => {
    const v = bySub[m.id] || 0;
    const cap = subCap(cat, m.id, yaNum);
    t += cap === null ? v : Math.min(v, cap); // a 0 cap means "not claimable this year"
  });
  return t;
}

/** Reliefs that come from who you are, not what you bought (Settings → Family & status). */
export function derivedReliefs(p: Profile, yaNum: number): Record<string, number> {
  const out: Record<string, number> = {};
  if (p.disabled) out.disabled_self = capFor('disabled_self', yaNum);
  const married = p.marital === 'married';
  const spouseRelief = married && p.spouseWorking === false;
  const spouseCap = capFor('spouse', yaNum);
  // a spouse without income gives the full RM4,000; formal alimony to a former wife shares the same cap
  const spouseAmt = Math.min(spouseCap, (spouseRelief ? spouseCap : 0) + Math.max(0, +(p.alimony || 0)));
  if (spouseAmt > 0) out.spouse = spouseAmt;
  if (spouseRelief && p.spouseDisabled) out.disabled_spouse = capFor('disabled_spouse', yaNum);
  const k = p.children;
  if (k) {
    const full = CHILDSUB.reduce((a, m) => a + (k[m.id as keyof ChildCounts] || 0) * m.amt, 0);
    // 50% only when another claimant who is not a spouse living with you (e.g. an ex-spouse) claims the same child (s.48(4))
    const share = p.childShare === 50 ? 0.5 : 1;
    if (full > 0) out.child = full * share;
  }
  return out;
}

export const PROFILE_CATS = ['spouse', 'disabled_self', 'disabled_spouse', 'child'];

/** Exempt part of a loss-of-employment compensation: RM10,000 per completed year, all of it on ill-health. */
export function compensationExempt(amount: number, years: number, illHealth?: boolean): number {
  if (!amount) return 0;
  if (illHealth) return amount;
  return Math.min(amount, 10000 * Math.max(0, Math.floor(years || 0)));
}

// caps where they differed from the current schedule (historical years approximate)
export const OVERRIDES: Record<number, Record<string, number>> = {
  2023: { sports: 500, edu_med_ins: 3000, disabled_self: 6000, disabled_spouse: 5000, housing: 0, tourism: 0 },
  2024: { edu_med_ins: 3000, disabled_self: 6000, disabled_spouse: 5000, housing: 0, tourism: 0 },
  2025: { tourism: 0 },
  2027: { tourism: 0 }, // YA2026 only
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
  const v = to2dp(n);
  return 'RM ' + v.toLocaleString('en-MY', Number.isInteger(v) ? {} : { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Group a typed amount string with thousands separators for display (blur state). */
export function fmtAmountStr(s: string): string {
  const n = +s;
  if (!isFinite(n) || s === '') return s;
  return n.toLocaleString('en-MY', s.includes('.') ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 0 });
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

/** Money precision: two decimal places, always. */
export function to2dp(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Constrain a typed amount string to digits with at most two decimals,
 *  dropping stray leading zeros (0200 → 200; 0.50 stays). */
export function clamp2dpStr(s: string): string {
  const m = s.replace(/[^\d.]/g, '').match(/^\d*(\.\d{0,2})?/);
  return m ? m[0].replace(/^0+(?=\d)/, '') : '';
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function blankInc(): IncomeYear {
  return { salary: 0, bonus: 0, pcb: 0, zakat: 0, rent: 0, rentExp: 0, other: 0, cp500: 0, biz: 0, spInc: 0, spRel: 9000, dividends: 0, compensation: 0, serviceYears: 0, levyRebate: 0 };
}

// sub-limit-aware medical total for a given year of assessment
export function medSum(claims: Claim[], yaNum: number): number {
  return subSum('medical', claims, yaNum);
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
  /** donation lines that share the 10% pool (approved bodies, sports, national-interest projects, wakaf) */
  donPooled: number;
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
  /** fixed reliefs counted from the profile this year (category → amount) */
  derived: Record<string, number>;
  compTaxable: number;
  compExempt: number;
  dividends: number;
  chargeableDiv: number;
  dividendTax: number;
  levyRebate: number;
}

export function calc(d: Data, ya: string): CalcResult {
  const yaNum = +ya.slice(2);
  const claims = d.claims.filter((c) => c.ya === ya);
  const inc = Object.assign(blankInc(), d.income[ya] || {});
  const netRent = Math.max(0, (+inc.rent || 0) - (+inc.rentExp || 0));
  const compExempt = compensationExempt(+inc.compensation || 0, +inc.serviceYears || 0, inc.compIllHealth);
  const compTaxable = Math.max(0, (+inc.compensation || 0) - compExempt);
  const dividends = +inc.dividends || 0;
  // aggregate income — dividends count from YA2025 (Income Tax (Determination of Chargeable Income … Dividend) Rules 2025)
  const totalIncome = (+inc.salary || 0) + (+inc.bonus || 0) + compTaxable + netRent + (+inc.other || 0) + (+inc.biz || 0) + dividends;
  const sums: Record<string, number> = {};
  claims.forEach((c) => {
    if (!SUBLIMITS[c.cat]) sums[c.cat] = (sums[c.cat] || 0) + (+c.amount || 0);
  });
  Object.keys(SUBLIMITS).forEach((cat) => {
    const cl = claims.filter((c) => c.cat === cat);
    if (cl.length) sums[cat] = subSum(cat, cl, yaNum);
  });
  // fixed family/status reliefs from the profile — only where no claim lines were entered for that category
  const derivedAll = derivedReliefs(d.profile, yaNum);
  // spouse relief (and the disabled-spouse relief that rides on it) needs a spouse with no income —
  // spouse income entered on the Income screen overrides whatever the profile says
  if ((+inc.spInc || 0) > 0) {
    // a spouse with taxable income under separate assessment: no spouse or disabled-spouse relief; formal alimony still counts
    const alimony = Math.min(capFor('spouse', yaNum), Math.max(0, +(d.profile.alimony || 0)));
    if (alimony > 0) derivedAll.spouse = alimony; else delete derivedAll.spouse;
    delete derivedAll.disabled_spouse;
  }
  const derived: Record<string, number> = {};
  PROFILE_CATS.forEach((cat) => {
    if (!sums[cat] && derivedAll[cat]) { sums[cat] = derivedAll[cat]; derived[cat] = derivedAll[cat]; }
  });
  const donRaw = sums.donation || 0;
  const donCap = Math.round(totalIncome * 0.10);
  // only the 'approved' group (s.44(6) bodies, sports, national-interest projects, wakaf) shares the 10% pool;
  // government gifts and the certified in-kind categories sit outside it, with their own sub-limits applied in sums
  const donPooled = claims.filter((c) => c.cat === 'donation' && (!c.sub || c.sub === 'approved')).reduce((a, c) => a + (+c.amount || 0), 0);
  const donAllowed = Math.min(donPooled, donCap) + Math.max(0, donRaw - donPooled);
  let reliefsNonDon = 9000;
  CATS.forEach((ct) => {
    if (ct.id === 'donation' || ct.id === 'individual') return;
    const cl = sums[ct.id] || 0;
    const cp = capFor(ct.id, yaNum);
    reliefsNonDon += cp === Infinity ? cl : Math.min(cl, cp);
  });
  const chargeable = Math.max(0, totalIncome - donAllowed - reliefsNonDon);
  // dividends: their share of chargeable income (A/B × C) leaves the scale; 2% applies above RM100,000 of it
  const chargeableDiv = dividends > 0 && totalIncome > 0 ? to2dp(chargeable * dividends / totalIncome) : 0;
  const dividendTax = to2dp(0.02 * Math.max(0, chargeableDiv - 100000));
  const taxGross = Math.round(taxOn(chargeable - chargeableDiv) + dividendTax);
  // s.6A(2): RM400 individual rebate, plus RM400 when the spouse or alimony deduction was allowed (both only when chargeable ≤ RM35,000)
  const rebate = chargeable <= 35000 ? Math.min(400 + ((sums.spouse || 0) > 0 ? 400 : 0), taxGross) : 0;
  const levyRebate = Math.min(+inc.levyRebate || 0, Math.max(0, taxGross - rebate));
  const zakatRebate = Math.min(+inc.zakat || 0, Math.max(0, taxGross - rebate - levyRebate));
  const taxNet = Math.max(0, taxGross - rebate - levyRebate - zakatRebate);
  const paid = (+inc.pcb || 0) + (+inc.cp500 || 0);
  const balance = taxNet - paid;
  return {
    claims, inc, sums, netRent, totalIncome, donRaw, donCap, donAllowed, donPooled, reliefsNonDon,
    totalAllowed: reliefsNonDon + donAllowed, chargeable, taxGross, rebate, zakatRebate,
    taxNet, paid, balance, formType: (+inc.biz || 0) > 0 ? 'B' : 'BE',
    derived, compTaxable, compExempt, dividends, chargeableDiv, dividendTax, levyRebate,
  };
}

// spouse-side and joint-assessment comparison (married filers)
export function jointComparison(c: CalcResult, opts: { spouseDisabled?: boolean; yaNum?: number } = {}) {
  const spInc = +c.inc.spInc || 0;
  const spRel = +c.inc.spRel || 0;
  const spCh = Math.max(0, spInc - spRel);
  const spTaxG = taxOn(spCh);
  const spTax = Math.max(0, spTaxG - (spCh <= 35000 ? Math.min(400, spTaxG) : 0));
  const sep = c.taxNet + spTax;
  // joint assessment gives the RM4,000 spouse relief once — don't count it again if the separate
  // computation already holds it (from the profile or a legacy claim line)
  const spouseAlready = Math.min(c.sums.spouse || 0, 4000);
  // a DSW-registered disabled spouse adds the further deduction under joint assessment even when they have income (s.45A(1), s.47(1)(b))
  const dsCap = opts.spouseDisabled ? capFor('disabled_spouse', opts.yaNum ?? SCHEDULE_YA) : 0;
  const dsAlready = Math.min(c.sums.disabled_spouse || 0, dsCap);
  const jCh = Math.max(0, c.totalIncome + spInc - c.donAllowed - (c.reliefsNonDon - spouseAlready - dsAlready) - 4000 - dsCap);
  const jG = taxOn(jCh);
  const jReb = jCh <= 35000 ? Math.min(800, jG) : 0;
  const joint = Math.max(0, jG - jReb - c.levyRebate - c.zakatRebate);
  return { sep, joint };
}
