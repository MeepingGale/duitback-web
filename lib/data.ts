// Persistence + seed data. Same localStorage key and IndexedDB store as every
// previous DuitBack build, so existing users keep their data across the port.
import { Data, IncomeYear, blankInc, uid } from './tax';

export const KEY = 'cukaiku_v3';

export function demoData(): Data {
  const inc = (o: Partial<IncomeYear>) => Object.assign(blankInc(), o);
  return {
    demo: true,
    profile: { name: 'Amirah', taxNo: 'SG 1234567-08', bank: 'Maybank ···8807', marital: 'single' },
    ya: 'YA2026',
    income: {
      YA2026: inc({ salary: 90000, bonus: 0, pcb: 5400, rent: 19200, rentExp: 5800, cp500: 1000 }),
      YA2025: inc({ salary: 86400, bonus: 7200, pcb: 7704, rent: 19200, rentExp: 6300 }),
      YA2024: inc({ salary: 81600, bonus: 4800, pcb: 7702, rent: 18000, rentExp: 5400 }),
      YA2023: inc({ salary: 76800, bonus: 3600, pcb: 6320, rent: 16800, rentExp: 4900 }),
    },
    claims: [
      { id: uid(), ya: 'YA2026', cat: 'lifestyle', date: '2026-08-02', desc: 'Unifi broadband (Jan–Aug)', amount: 688, receipt: null },
      { id: uid(), ya: 'YA2026', cat: 'prs', date: '2026-06-30', desc: 'Principal PRS — H1', amount: 1500, receipt: 'prs-h1-2026.pdf' },
      { id: uid(), ya: 'YA2026', cat: 'epf', date: '2026-08-01', desc: 'EPF employee contribution (YTD)', amount: 2360, receipt: null },
      { id: uid(), ya: 'YA2026', cat: 'socso', date: '2026-08-01', desc: 'SOCSO + EIS (YTD)', amount: 158, receipt: null },
      { id: uid(), ya: 'YA2026', cat: 'medical', sub: 'general', date: '2026-05-14', desc: 'Klinik Mediviron — treatment', amount: 120, receipt: 'klinik-may26.pdf' },
      { id: uid(), ya: 'YA2025', cat: 'lifestyle', date: '2025-08-12', desc: 'Kinokuniya — books', amount: 148, receipt: 'receipt-0812.jpg' },
      { id: uid(), ya: 'YA2025', cat: 'lifestyle', date: '2025-07-03', desc: 'Fitness First — gym membership', amount: 960, receipt: 'invoice-ff-q3.pdf' },
      { id: uid(), ya: 'YA2025', cat: 'lifestyle', date: '2025-05-21', desc: 'Machines — tablet', amount: 672, receipt: 'receipt-mch.pdf' },
      { id: uid(), ya: 'YA2025', cat: 'medical', sub: 'general', date: '2025-07-30', desc: 'Klinik Mediviron — treatment', amount: 180, receipt: 'klinik-mediviron.pdf' },
      { id: uid(), ya: 'YA2025', cat: 'medical', sub: 'checkup', date: '2025-03-14', desc: 'Full medical check-up', amount: 660, receipt: null },
      { id: uid(), ya: 'YA2025', cat: 'medical', sub: 'dental', date: '2025-02-02', desc: 'Dental scaling & filling', amount: 1500, receipt: null },
      { id: uid(), ya: 'YA2025', cat: 'prs', date: '2025-06-15', desc: 'Principal PRS — Q1+Q2', amount: 1500, receipt: 'prs-statement-q2.pdf' },
      { id: uid(), ya: 'YA2025', cat: 'prs', date: '2025-01-20', desc: 'Principal PRS — top-up', amount: 1500, receipt: null },
      { id: uid(), ya: 'YA2025', cat: 'epf', date: '2025-12-31', desc: 'EPF employee contribution', amount: 3540, receipt: null },
      { id: uid(), ya: 'YA2025', cat: 'socso', date: '2025-12-31', desc: 'SOCSO + EIS', amount: 238, receipt: null },
      { id: uid(), ya: 'YA2025', cat: 'life_ins', date: '2025-01-12', desc: 'Takaful annual premium', amount: 2400, receipt: 'takaful-2025.pdf' },
      { id: uid(), ya: 'YA2025', cat: 'edu_med_ins', date: '2025-01-12', desc: 'Medical card rider', amount: 420, receipt: null },
      { id: uid(), ya: 'YA2025', cat: 'donation', date: '2025-05-08', desc: 'Wakaf — approved institution', amount: 300, receipt: 'wakaf-resit-005.pdf' },
      { id: uid(), ya: 'YA2025', cat: 'lifestyle', date: '2025-04-02', desc: 'Unifi broadband (Jan–Apr)', amount: 516, receipt: null },
      { id: uid(), ya: 'YA2024', cat: 'lifestyle', date: '2024-06-11', desc: 'Laptop — Machines', amount: 2500, receipt: null },
      { id: uid(), ya: 'YA2024', cat: 'prs', date: '2024-11-02', desc: 'Principal PRS', amount: 3000, receipt: null },
      { id: uid(), ya: 'YA2024', cat: 'epf', date: '2024-12-31', desc: 'EPF employee contribution', amount: 4000, receipt: null },
      { id: uid(), ya: 'YA2024', cat: 'medical', sub: 'general', date: '2024-09-19', desc: 'Clinic visits', amount: 840, receipt: null },
      { id: uid(), ya: 'YA2023', cat: 'lifestyle', date: '2023-08-05', desc: 'Phone — Samsung', amount: 2500, receipt: null },
      { id: uid(), ya: 'YA2023', cat: 'epf', date: '2023-12-31', desc: 'EPF employee contribution', amount: 4000, receipt: null },
    ],
    receipts: [
      { id: uid(), ya: 'YA2026', cat: 'prs', name: 'prs-h1-2026.pdf', sub: 'Principal PRS · 30 Jun 2026 · RM 1,500', thumb: null },
      { id: uid(), ya: 'YA2026', cat: 'medical', name: 'klinik-may26.pdf', sub: 'Clinic visit · 14 May 2026 · RM 120', thumb: null },
      { id: uid(), ya: 'YA2026', cat: null, name: 'IMG_5108.jpg', sub: 'Uploaded · untagged', thumb: null },
      { id: uid(), ya: 'YA2025', cat: 'lifestyle', name: 'receipt-0812.jpg', sub: 'Kinokuniya · 12 Aug 2025 · RM 148', thumb: null },
      { id: uid(), ya: 'YA2025', cat: 'medical', name: 'klinik-mediviron.pdf', sub: 'Clinic visit · 30 Jul 2025 · RM 180', thumb: null },
      { id: uid(), ya: 'YA2025', cat: 'prs', name: 'prs-statement-q2.pdf', sub: 'Principal PRS · 15 Jun 2025 · RM 1,500', thumb: null },
      { id: uid(), ya: 'YA2025', cat: 'lifestyle', name: 'invoice-ff-q3.pdf', sub: 'Fitness First · 03 Jul 2025 · RM 960', thumb: null },
      { id: uid(), ya: 'YA2025', cat: 'donation', name: 'wakaf-resit-005.pdf', sub: 'Donation · 08 May 2025 · RM 300', thumb: null },
      { id: uid(), ya: 'YA2025', cat: 'life_ins', name: 'takaful-2025.pdf', sub: 'Annual premium · 12 Jan 2025 · RM 2,400', thumb: null },
      { id: uid(), ya: 'YA2025', cat: 'lifestyle', name: 'receipt-mch.pdf', sub: 'Machines · 21 May 2025 · RM 672', thumb: null },
    ],
    docs: [
      { id: uid(), ya: 'YA2026', name: 'PRS-statement-H1.pdf', kind: 'Premium statement', date: '2026-07-02' },
      { id: uid(), ya: 'YA2025', name: 'EA-form-2025.pdf', kind: 'EA form', date: '2026-02-16' },
      { id: uid(), ya: 'YA2025', name: 'BE-acknowledgement.pdf', kind: 'e-Filing acknowledgement', date: '2026-03-15' },
      { id: uid(), ya: 'YA2025', name: 'tax-computation-2025.pdf', kind: 'Tax computation', date: '2026-03-15' },
      { id: uid(), ya: 'YA2025', name: 'refund-advice.pdf', kind: 'Refund advice', date: '2026-05-02' },
      { id: uid(), ya: 'YA2024', name: 'EA-form-2024.pdf', kind: 'EA form', date: '2025-02-18' },
      { id: uid(), ya: 'YA2024', name: 'BE-ack-2024.pdf', kind: 'e-Filing acknowledgement', date: '2025-03-28' },
    ],
    status: {
      YA2026: { stage: 'tracking' },
      YA2025: { stage: 'refund', drafted: '2026-03-15', submitted: '2026-03-15', processing: '2026-03-22', refunded: '2026-05-02', ack: 'EF-2026-9174820' },
      YA2024: { stage: 'refund', drafted: '2025-03-28', submitted: '2025-03-28', processing: '2025-04-02', refunded: '2025-04-14', ack: 'EF-2025-8841302' },
      YA2023: { stage: 'refund', drafted: '2024-04-12', submitted: '2024-04-12', processing: '2024-04-20', refunded: '2024-05-16', ack: 'EF-2024-5510877' },
    },
  };
}

export function emptyData(): Data {
  const y = new Date().getFullYear();
  const income: Data['income'] = {};
  income['YA' + y] = blankInc();
  income['YA' + (y - 1)] = blankInc();
  const status: Data['status'] = {};
  status['YA' + y] = { stage: 'tracking' };
  status['YA' + (y - 1)] = { stage: 'tracking' };
  return { profile: { name: 'there', taxNo: '', bank: '', marital: 'single' }, ya: 'YA' + y, income, claims: [], receipts: [], docs: [], status };
}

export function loadData(): Data | null {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null');
    return d && d.claims ? (d as Data) : null;
  } catch {
    return null;
  }
}

/** Returns an error message on failure, '' on success. */
export function persist(d: Data): string {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
    return '';
  } catch {
    return 'Browser storage is full — delete some receipts or export + clear. · Storan pelayar penuh — padam resit atau eksport dahulu.';
  }
}

export function wipe(): void {
  try { localStorage.removeItem(KEY); localStorage.removeItem(META_KEY); localStorage.removeItem(STASH_KEY); } catch {}
}

// While the demo is loaded, the user's own data waits under this key so
// exiting the demo can hand it straight back.
export const STASH_KEY = 'cukaiku_v3_stash';

export function stashReal(d: Data): boolean {
  try { localStorage.setItem(STASH_KEY, JSON.stringify(d)); return true; } catch { return false; }
}

export function popStash(): Data | null {
  try {
    const raw = localStorage.getItem(STASH_KEY);
    if (!raw) return null;
    localStorage.removeItem(STASH_KEY);
    const d = JSON.parse(raw);
    return d && d.profile ? (d as Data) : null;
  } catch { return null; }
}

export function hasStash(): boolean {
  try { return !!localStorage.getItem(STASH_KEY); } catch { return false; }
}

// ---- backup meta: nudge users to export before localStorage betrays them ----
const META_KEY = 'duitback_meta';

export interface BackupMeta {
  lastExport: string | null;
  changesSince: number;
}

export function getBackupMeta(): BackupMeta {
  try {
    const m = JSON.parse(localStorage.getItem(META_KEY) || 'null');
    if (m && typeof m.changesSince === 'number') return m as BackupMeta;
  } catch {}
  return { lastExport: null, changesSince: 0 };
}

function setBackupMeta(m: BackupMeta): void {
  try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch {}
}

export function bumpChanges(): void {
  const m = getBackupMeta();
  setBackupMeta({ ...m, changesSince: m.changesSince + 1 });
}

function noteExport(): void {
  setBackupMeta({ lastExport: new Date().toISOString().slice(0, 10), changesSince: 0 });
}

// legacy demo saves predate the demo flag — recognise them by the demo tax no.
export function isDemo(d: Data): boolean {
  return !!d.demo || (!!d.profile && d.profile.taxNo === 'SG 1234567-08');
}

/** Remove year scaffolds beyond the current calendar year that hold no user
 *  data at all (no claims, receipts, docs, or income). Returns true if changed. */
export function pruneEmptyFutureYears(d: Data, currentYear = new Date().getFullYear()): boolean {
  let changed = false;
  for (const ya of Object.keys(d.income)) {
    const n = +ya.slice(2);
    if (!(n > currentYear)) continue;
    const hasStuff =
      d.claims.some((c) => c.ya === ya) ||
      d.receipts.some((r) => r.ya === ya) ||
      d.docs.some((x) => x.ya === ya) ||
      Object.entries(d.income[ya] || {}).some(([k, v]) => k !== 'spRel' && typeof v === 'number' && v > 0);
    if (hasStuff) continue;
    delete d.income[ya];
    delete d.status[ya];
    changed = true;
  }
  if (changed && !d.income[d.ya]) {
    d.ya = Object.keys(d.income).sort((a, b) => b.localeCompare(a))[0];
  }
  return changed;
}

// ---- IndexedDB: full-size receipt files (thumbnails live in the JSON blob) ----
let dbPromise: Promise<IDBDatabase | null> | null = null;
function idb(): Promise<IDBDatabase | null> {
  if (!dbPromise) {
    dbPromise = new Promise((res) => {
      try {
        const r = indexedDB.open('cukaiku', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('files');
        r.onsuccess = () => res(r.result);
        r.onerror = () => res(null);
      } catch {
        res(null);
      }
    });
  }
  return dbPromise;
}

export async function putFile(id: string, val: string): Promise<void> {
  const db = await idb();
  if (db && val) try { db.transaction('files', 'readwrite').objectStore('files').put(val, id); } catch {}
}

export async function getFile(id: string): Promise<string | null> {
  const db = await idb();
  if (!db) return null;
  return new Promise((res) => {
    try {
      const q = db.transaction('files').objectStore('files').get(id);
      q.onsuccess = () => res((q.result as string) || null);
      q.onerror = () => res(null);
    } catch {
      res(null);
    }
  });
}

export async function delFile(id: string): Promise<void> {
  const db = await idb();
  if (db) try { db.transaction('files', 'readwrite').objectStore('files').delete(id); } catch {}
}

/** Read picked/dropped files: images get a thumbnail + a bounded full-size JPEG; others pass through as data URLs. */
export function readFiles(files: FileList | File[], cb: (name: string, thumb: string | null, full: string) => void): void {
  Array.from(files).forEach((f) => {
    if (f.type.startsWith('image/')) {
      const rd = new FileReader();
      rd.onload = () => {
        const img = new Image();
        img.onload = () => {
          const mk = (max: number, q: number) => {
            const s = Math.min(1, max / img.width);
            const cv = document.createElement('canvas');
            cv.width = Math.round(img.width * s);
            cv.height = Math.round(img.height * s);
            cv.getContext('2d')!.drawImage(img, 0, 0, cv.width, cv.height);
            return cv.toDataURL('image/jpeg', q);
          };
          cb(f.name, mk(320, 0.55), mk(1600, 0.8));
        };
        img.src = rd.result as string;
      };
      rd.readAsDataURL(f);
    } else {
      const rd = new FileReader();
      rd.onload = () => cb(f.name, null, rd.result as string);
      rd.readAsDataURL(f);
    }
  });
}

export function exportJson(d: Data): void {
  const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'duitback-data.json';
  a.click();
  URL.revokeObjectURL(a.href);
  noteExport();
}

/** Validate an imported blob; returns the data or an error message. */
export function parseImport(text: string): { data?: Data; error?: string } {
  try {
    const j = JSON.parse(text);
    if (j && Array.isArray(j.claims) && j.income) {
      if (!j.income[j.ya]) j.ya = Object.keys(j.income)[0];
      return { data: j as Data };
    }
    return { error: 'That file is not a DuitBack export. · Fail itu bukan eksport DuitBack.' };
  } catch {
    return { error: 'Could not read that file as JSON. · Fail tidak dapat dibaca sebagai JSON.' };
  }
}
