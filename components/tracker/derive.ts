// Presentation-level derivations shared across screens — pure functions.
import { CATS, CalcResult, Data, calc, capFor, fmt, SUBLIMITS } from '@/lib/tax';

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
    // donations: only the pooled lines are limited to 10%; government and certified in-kind gifts sit on top
    const cap = ct.id === 'donation' ? c.donCap + Math.max(0, c.donRaw - c.donPooled) : capFor(ct.id, yaNum);
    const lines = c.claims.filter((x) => x.cat === ct.id);
    const lineSum = lines.reduce((a, x) => a + (+x.amount || 0), 0);
    const fromProfile = !lines.length && !!c.derived[ct.id];
    const rawClaimed = ct.auto ? 9000 : fromProfile ? c.derived[ct.id] : lineSum;
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
      count: ct.auto ? 'auto' : fromProfile ? 'profile' : String(lines.length),
      claimed: rawClaimed,
      allowed: noCap ? rawClaimed : Math.min(SUBLIMITS[ct.id] && lines.length ? c.sums[ct.id] || 0 : rawClaimed, cap),
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
  if (stg === 'refund') dline = ya + ' return filed and refund credited — history on the Status page. · Bayaran balik telah dikreditkan.';
  else if (stg !== 'tracking') dline = ya + ' return submitted — track it on the Status page. · Penyata telah dihantar.';
  else if (now < open) dline = 'e-Filing opens 1 Mar ' + (yaNum + 1) + ' — in ' + dTo(open) + ' days · ' + dTo(open) + ' hari lagi';
  else if (now <= dl) dline = 'e-Filing open · ' + c.formType + ' deadline ' + dlLabel + ' — ' + dTo(dl) + ' days left · ' + dTo(dl) + ' hari lagi';
  else dline = ya + ' filing window closed ' + dlLabel + ' · Tempoh e-Filing telah tamat';
  return {
    dline,
    filingWindow: now > dl ? 'window closed ' + dlLabel : '1 Mar – ' + dlLabel,
    formLine:
      c.formType === 'B'
        ? 'Form B (business income) — deadline ' + dlLabel + ', e-Filing grace to mid-Jul. · Borang B — tarikh akhir ' + dlLabel + '.'
        : 'Form BE (no business income) — deadline ' + dlLabel + ', e-Filing grace to mid-May. · Borang BE — tarikh akhir ' + dlLabel + '.',
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

/** After a photo lands in the vault, look for a MyInvois QR in the background and mark the receipt as a
 *  validated e-invoice. Runs off the main thread of the person's attention: nothing waits on it. */
export function markEInvoice(mut: (fn: (d: Data) => void) => void, id: string, full: string | null | undefined): void {
  if (!full || !(full.startsWith('data:image/') || full.startsWith('data:application/pdf'))) return;
  Promise.all([import('@/lib/qr'), import('@/lib/pdf')])
    .then(async ([{ scanForEInvoice }, { receiptImage }]) => { const img = await receiptImage(full); return img ? scanForEInvoice(img) : null; })
    .then((s) => {
      if (!s || !s.einv) return;
      mut((dd) => { const r = dd.receipts.find((x) => x.id === id); if (r) { r.einv = s.einv; r.proof = 'einvoice'; } });
    })
    .catch(() => {});
}
