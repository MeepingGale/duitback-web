/** Turn OCR text from a receipt into form values: plain rules, no model, so every pick is explainable
 *  and testable. Everything here is a suggestion the person confirms — nothing is saved from it directly. */
export type ProofType = 'einvoice' | 'receipt' | 'statement';
export interface ReceiptRead { merchant?: string; date?: string; amount?: number; cat?: string; catWhy?: string; proof: ProofType }

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mac: 3, mar: 3, apr: 4, mei: 5, may: 5, jun: 6, jul: 7, ogo: 8, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, dis: 12, dec: 12,
};

/** Merchant keywords → relief category. First hit wins, so the list is ordered from specific to broad. */
export const CATEGORY_HINTS: { cat: string; words: string[] }[] = [
  { cat: 'childcare', words: ['taska', 'tadika', 'kindergarten', 'kindergarden', 'nursery', 'childcare', 'child care', 'daycare', 'pusat jagaan kanak', 'transit'] },
  { cat: 'breastfeed', words: ['breast pump', 'pam susu', 'medela', 'spectra', 'breastfeeding', 'penyusuan'] },
  { cat: 'sspn', words: ['sspn', 'simpan sspn', 'ptptn'] },
  { cat: 'prs', words: ['prs', 'private retirement', 'skim persaraan swasta', 'principal prs', 'public mutual prs', 'kenanga prs', 'amprs'] },
  { cat: 'epf', words: ['kwsp', 'epf', 'i-saraan', 'caruman sukarela'] },
  { cat: 'socso', words: ['perkeso', 'socso', 'sip', 'eis'] },
  { cat: 'edu_med_ins', words: ['medical card', 'medical insurance', 'health insurance', 'insurans perubatan', 'education policy', 'education plan', 'pelan pendidikan'] },
  { cat: 'life_ins', words: ['prudential', 'aia ', 'great eastern', 'allianz', 'etiqa', 'takaful', 'zurich', 'tokio marine', 'manulife', 'hong leong assurance', 'sun life', 'life insurance', 'insurans nyawa', 'premium'] },
  { cat: 'equip', words: ['hearing aid', 'alat bantu pendengaran', 'wheelchair', 'kerusi roda', 'prosthetic', 'prosthesis', 'kaki palsu'] },
  { cat: 'ev', words: ['chargev', 'jomcharge', 'gentari', 'ev charg', 'wallbox', 'pengecas', 'composter', 'cctv'] },
  { cat: 'housing', words: ['housing loan', 'home loan', 'pinjaman perumahan', 'interest statement', 'penyata faedah', 'mortgage'] },
  { cat: 'edu_self', words: ['universiti', 'university', 'kolej', 'college', 'tuition fee', 'yuran pengajian', 'yuran pendidikan', 'open university', 'uitm', 'unitar', 'taylor', 'sunway university', 'monash', 'jpk', 'skills development', 'course fee', 'yuran kursus'] },
  { cat: 'donation', words: ['tabung', 'derma', 'donation', 'yayasan', 'foundation', 'masjid', 'surau', 'wakaf', 'mercy malaysia', 'zakat', 'sumbangan'] },
  { cat: 'tourism', words: ['zoo ', 'aquaria', 'legoland', 'theme park', 'taman tema', 'museum', 'muzium', 'sunway lagoon', 'skyworlds', 'entrance ticket', 'tiket masuk', 'cultural show'] },
  { cat: 'sports', words: ['gym', 'fitness', 'decathlon', 'sports direct', 'al-ikhsan', 'badminton', 'futsal', 'swimming', 'kolam renang', 'stadium', 'sukan', 'racket', 'raket', 'yoga', 'pickleball', 'golf', 'sport'] },
  { cat: 'medical', words: ['klinik', 'clinic', 'hospital', 'pusat perubatan', 'medical centre', 'medical center', 'poliklinik', 'pergigian', 'dental', 'farmasi', 'pharmacy', 'guardian', 'watson', 'caring', 'alpro', 'big pharmacy', 'vaksin', 'vaccin', 'dr.', 'doctor', 'health screening', 'pathlab', 'bp lab', 'pusat pakar', 'specialist'] },
  { cat: 'lifestyle', words: ['popular', 'mph', 'kinokuniya', 'bookstore', 'book store', 'kedai buku', 'buku', 'books', 'times bookstore', 'unifi', 'maxis', 'celcom', 'digi', 'time dotcom', 'streamyx', 'u mobile', 'umobile', 'yes 5g', 'internet', 'broadband', 'fibre', 'fiber', 'apple', 'machines', 'switch', 'senheng', 'harvey norman', 'courts', 'best denki', 'computer', 'laptop', 'tablet', 'smartphone', 'ipad', 'iphone', 'samsung'] },
];

// a figure with two decimals anywhere, or a whole number when it is explicitly prefixed with RM ("Total RM120")
const MONEY = /(?:RM|MYR)\s*(\d{1,3}(?:[ ,]\d{3})+(?:\.\d{2})?|\d+(?:\.\d{2})?)(?!\d)|(\d{1,3}(?:[ ,]\d{3})+\.\d{2}|\d+\.\d{2})/g;
const TOTAL_LINE = /\b(grand\s*total|total|jumlah|amount\s*(due|payable|paid)|net\s*(total|amount|payable)|nett|bayaran|payable|amount)\b/i;
// lines that carry a figure but are never the amount paid
const NOT_AMOUNT = /change|baki|tunai|cash|tendered|balance|deposit|point|mata|rounding|pembundaran|discount|diskaun|saving/i;
// …and, for a line that mentions a total, the ones that are a partial total rather than the final one
const NOT_TOTAL = /sub\s*-?\s*total|subjumlah|sub\s*jumlah|tax\s*(rate|amount)?\s*\d|sst\s*\d|gst\s*\d|service\s*charge|before|sebelum|qty|kuantiti|item/i;
const SKIP_MERCHANT = /receipt|resit|invoice|invois|cukai|no\.|no:|tel|fax|phone|gst|sst|website|www\.|http|@|\d{6,}|jalan|lorong|taman|street|road|kuala|selangor|johor|penang|pulau|melaka|negeri|pahang|perak|kedah|sabah|sarawak|putrajaya|labuan|terengganu|kelantan|perlis|date|tarikh|cashier|juruwang|thank|terima kasih|welcome|selamat/i;

function num(s: string): number { return +s.replace(/[ ,]/g, '').replace(/[Oo]/g, '0').replace(/[lI]/g, '1'); }

function pickAmount(lines: string[]): number | undefined {
  const money = (l: string) => [...l.matchAll(MONEY)].map((m) => num(m[1] || m[2])).filter((n) => n > 0 && n < 10_000_000);
  const totals = lines.filter((l) => TOTAL_LINE.test(l) && !NOT_TOTAL.test(l) && !NOT_AMOUNT.test(l)).map(money).filter((a) => a.length);
  if (totals.length) return totals[totals.length - 1].slice(-1)[0]; // the last total-ish line, its last figure
  const all = lines.filter((l) => !NOT_AMOUNT.test(l)).flatMap(money);
  return all.length ? Math.max(...all) : undefined;
}

function pad(n: number): string { return String(n).padStart(2, '0'); }
function validDate(y: number, m: number, d: number, today: Date): string | undefined {
  if (y < 100) y += 2000;
  if (y < 2000 || m < 1 || m > 12 || d < 1 || d > 31) return undefined;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1) return undefined;
  if (dt.getTime() > today.getTime() + 2 * 86400000) return undefined; // tomorrow at most — receipts are not from the future
  return `${y}-${pad(m)}-${pad(d)}`;
}

function pickDate(lines: string[], today: Date): string | undefined {
  const found: { s: string; keyed: boolean }[] = [];
  for (const l of lines) {
    const keyed = /date|tarikh|tkh|dated|issued/i.test(l);
    let m: RegExpMatchArray | null;
    if ((m = l.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/))) { const s = validDate(+m[1], +m[2], +m[3], today); if (s) found.push({ s, keyed }); continue; }
    if ((m = l.match(/\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b/))) {
      // Malaysian receipts print day first; only fall back to month-first when day-first is impossible
      const s = validDate(+m[3], +m[2], +m[1], today) || validDate(+m[3], +m[1], +m[2], today);
      if (s) found.push({ s, keyed });
      continue;
    }
    if ((m = l.match(/\b(\d{1,2})\s*([A-Za-z]{3})[A-Za-z]*\.?,?\s*(\d{2,4})\b/))) {
      const mo = MONTHS[m[2].toLowerCase()];
      if (mo) { const s = validDate(+m[3], mo, +m[1], today); if (s) found.push({ s, keyed }); }
    }
  }
  return (found.find((f) => f.keyed) || found[0])?.s;
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/(^|[\s(/-])([a-z])/g, (m, a, b) => a + b.toUpperCase()).replace(/\bSdn\b/g, 'Sdn').replace(/\bBhd\b/g, 'Bhd');
}

function pickMerchant(lines: string[]): string | undefined {
  for (const raw of lines.slice(0, 6)) {
    const l = raw.replace(/[^\w&'.,()/ -]/g, ' ').replace(/\s+/g, ' ').trim();
    const letters = (l.match(/[A-Za-z]/g) || []).length;
    if (letters < 3 || SKIP_MERCHANT.test(l)) continue;
    const clean = l.replace(/[.,:;\- ]+$/, '').slice(0, 48);
    return clean === clean.toUpperCase() ? titleCase(clean) : clean;
  }
  return undefined;
}

/** Best relief category for a merchant/receipt text, with the keyword that decided it. */
export function suggestCategory(text: string): { cat: string; why: string } | null {
  const t = ' ' + text.toLowerCase().replace(/\s+/g, ' ') + ' ';
  for (const h of CATEGORY_HINTS) for (const w of h.words) if (t.includes(w)) return { cat: h.cat, why: w.trim() };
  return null;
}

export function parseReceiptText(text: string, opts: { today?: Date; einvoice?: boolean } = {}): ReceiptRead {
  const today = opts.today || new Date();
  const lines = text.split(/\r?\n/).map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const merchant = pickMerchant(lines);
  const cat = suggestCategory((merchant || '') + '\n' + lines.slice(0, 12).join('\n')) || suggestCategory(text);
  const proof: ProofType = opts.einvoice || /e-?invois|e-?invoice|myinvois/i.test(text) ? 'einvoice' : /penyata|statement/i.test(text) ? 'statement' : 'receipt';
  return { merchant, date: pickDate(lines, today), amount: pickAmount(lines), cat: cat?.cat, catWhy: cat?.why, proof };
}
