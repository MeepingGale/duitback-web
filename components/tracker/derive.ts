// Presentation-level derivations shared across screens — pure functions.
import { CATS, CalcResult, Data, calc, capFor, fmt } from '@/lib/tax';

export interface ReliefRow {
  id: string;
  en: string;
  bm: string;
  capL: string;
  claimedL: string;
  leftL: string;
  pct: number;
  over: boolean;
  tagCls: string;
  tagLabel: string;
  count: string;
  claimed: number;
  allowed: number;
}

export function reliefRows(c: CalcResult, ya: string): ReliefRow[] {
  const yaNum = +ya.slice(2);
  return CATS.map((ct) => {
    const cap = ct.id === 'donation' ? c.donCap : capFor(ct.id, yaNum);
    const rawClaimed = ct.auto ? 9000 : c.claims.filter((x) => x.cat === ct.id).reduce((a, x) => a + (+x.amount || 0), 0);
    const noCap = cap === Infinity;
    const na = cap === 0 && !ct.auto;
    const over = !noCap && !na && rawClaimed > cap;
    const pct = noCap ? (rawClaimed ? 100 : 0) : cap ? Math.min(100, Math.round((rawClaimed / cap) * 100)) : 0;
    return {
      id: ct.id,
      en: ct.en,
      bm: ct.bm,
      capL: na ? 'n/a' : noCap ? 'per child' : ct.id === 'donation' ? '~' + fmt(cap) : fmt(cap),
      claimedL: rawClaimed ? fmt(rawClaimed) : '—',
      leftL: na ? 'not in ' + ya : noCap ? '—' : over ? 'over by ' + fmt(rawClaimed - cap) : fmt(Math.max(0, cap - rawClaimed)),
      pct,
      over,
      tagCls: over ? 'tag-outline' : pct >= 100 && !noCap && !na ? 'tag-accent' : 'tag-neutral',
      tagLabel: na ? 'Not available' : over ? 'Over cap · flagged' : noCap ? (rawClaimed ? 'No cap' : '—') : pct >= 100 ? 'Maxed' : fmt(Math.max(0, cap - rawClaimed)) + ' left',
      count: ct.auto ? 'auto' : String(c.claims.filter((x) => x.cat === ct.id).length),
      claimed: rawClaimed,
      allowed: noCap ? rawClaimed : Math.min(ct.id === 'medical' ? c.sums.medical || 0 : rawClaimed, cap),
    };
  });
}

export interface DeadlineInfo {
  dline: string;
  filingWindow: string;
  formLine: string;
  dlLabel: string;
}

export function deadlineInfo(d: Data, ya: string, c: CalcResult): DeadlineInfo {
  const yaNum = +ya.slice(2);
  const now = new Date();
  const open = new Date(yaNum + 1 + '-03-01');
  const dl = new Date(yaNum + 1 + (c.formType === 'B' ? '-06-30' : '-04-30'));
  const dlLabel = (c.formType === 'B' ? '30 Jun ' : '30 Apr ') + (yaNum + 1);
  const dTo = (x: Date) => Math.ceil((x.getTime() - now.getTime()) / 86400000);
  const stg = (d.status[ya] || {}).stage || 'tracking';
  let dline: string;
  if (stg === 'refund') dline = ya + ' return filed and refund credited — history on the Status page.';
  else if (stg !== 'tracking') dline = ya + ' return submitted — track it on the Status page.';
  else if (now < open) dline = 'e-Filing opens 1 Mar ' + (yaNum + 1) + ' — in ' + dTo(open) + ' days · ' + dTo(open) + ' hari lagi';
  else if (now <= dl) dline = 'e-Filing open · ' + c.formType + ' deadline ' + dlLabel + ' — ' + dTo(dl) + ' days left · ' + dTo(dl) + ' hari lagi';
  else dline = ya + ' filing window closed ' + dlLabel + ' · Tempoh e-Filing telah tamat';
  return {
    dline,
    filingWindow: now > dl ? 'window closed ' + dlLabel : '1 Mar – ' + dlLabel,
    formLine:
      c.formType === 'B'
        ? 'Form B (business income) — deadline ' + dlLabel + ', e-Filing grace to mid-Jul.'
        : 'Form BE (no business income) — deadline ' + dlLabel + ', e-Filing grace to mid-May.',
    dlLabel,
  };
}

export const STATUS_TAG: Record<string, [string, string]> = {
  tracking: ['Tracking claims · Dalam rekod', 'tag-outline'],
  submitted: ['Submitted · Dihantar', 'tag-neutral'],
  processing: ['Processing · Diproses', 'tag-neutral'],
  refund: ['Refund credited · Selesai', 'tag-accent'],
};

export function yearsOf(d: Data): string[] {
  return Object.keys(d.income).sort((a, b) => b.localeCompare(a));
}

export function calcFor(d: Data, ya: string): CalcResult {
  return calc(d, ya);
}
