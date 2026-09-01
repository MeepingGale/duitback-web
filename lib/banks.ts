// Malaysian retail banks for the refund-account picker. Account-number
// lengths come from the banks' own IBG (Interbank GIRO) account-structure
// listings; banks without a verified length just get digits-only enforcement.
export interface Bank {
  name: string;
  len?: number; // expected digits for savings/current transfers, when verified
  abbr: string; // monogram for the identity chip (no trademarked artwork)
  color: string; // approximate brand colour for the chip tile
  ink?: string; // chip text colour when white would not read
}

export const BANKS: Bank[] = [
  { name: 'Maybank', len: 12, abbr: 'MBB', color: '#ffc83d', ink: '#201e1d' },
  { name: 'CIMB Bank', len: 10, abbr: 'CIMB', color: '#ec1c24' },
  { name: 'Public Bank', len: 10, abbr: 'PBB', color: '#d71920' },
  { name: 'RHB Bank', len: 14, abbr: 'RHB', color: '#0067b1' },
  { name: 'Hong Leong Bank', len: 11, abbr: 'HLB', color: '#003da5' },
  { name: 'AmBank', len: 13, abbr: 'AMB', color: '#e4002b' },
  { name: 'Bank Islam', abbr: 'BIMB', color: '#00915a' },
  { name: 'Bank Muamalat', abbr: 'BMMB', color: '#f58220' },
  { name: 'Bank Rakyat', abbr: 'BKRM', color: '#005baa' },
  { name: 'BSN', len: 16, abbr: 'BSN', color: '#0072bc' },
  { name: 'Affin Bank', abbr: 'AFF', color: '#00537f' },
  { name: 'Alliance Bank', abbr: 'ALL', color: '#e21937' },
  { name: 'Agrobank', abbr: 'AGRO', color: '#00843d' },
  { name: 'HSBC', abbr: 'HSBC', color: '#db0011' },
  { name: 'OCBC', abbr: 'OCBC', color: '#ee2e24' },
  { name: 'Standard Chartered', abbr: 'SC', color: '#005eb8' },
  { name: 'UOB', abbr: 'UOB', color: '#002469' },
  { name: 'MBSB Bank', abbr: 'MBSB', color: '#00a19c' },
  { name: 'Al Rajhi Bank', abbr: 'ARB', color: '#004a98' },
  { name: 'GXBank', abbr: 'GX', color: '#201e1d' },
  { name: 'Boost Bank', abbr: 'BST', color: '#eb2226' },
  { name: 'AEON Bank', abbr: 'AEON', color: '#a6338c' },
  { name: 'Other · Lain-lain', abbr: '?', color: '#9b9797' },
];

export function parseBank(raw: string): { bank: string; digits: string } {
  const t = raw.trim();
  const hit = BANKS.find((b) => t.toLowerCase().startsWith(b.name.toLowerCase()));
  // legacy values like "Maybank ···8807" parse cleanly: name match + digit strip
  return { bank: hit ? hit.name : t ? 'Other · Lain-lain' : '', digits: raw.replace(/\D/g, '').slice(0, 17) };
}

export function composeBank(bank: string, digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 17);
  if (!bank && !d) return '';
  return (bank || 'Bank') + (d ? ' ' + d : '');
}

/** Display form: bank + last four digits only ("Maybank ···8807"). */
export function maskBank(raw: string): string {
  if (!raw.trim()) return '';
  const { bank, digits } = parseBank(raw);
  if (!digits) return bank;
  return (bank || 'Bank') + ' ···' + digits.slice(-4);
}
