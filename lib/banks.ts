// Malaysian retail banks for the refund-account picker. Account-number
// lengths come from the banks' own IBG (Interbank GIRO) account-structure
// listings; banks without a verified length just get digits-only enforcement.
export interface Bank {
  name: string;
  len?: number; // expected digits for savings/current transfers, when verified
}

export const BANKS: Bank[] = [
  { name: 'Maybank', len: 12 },
  { name: 'CIMB Bank', len: 10 },
  { name: 'Public Bank', len: 10 },
  { name: 'RHB Bank', len: 14 },
  { name: 'Hong Leong Bank', len: 11 },
  { name: 'AmBank', len: 13 },
  { name: 'Bank Islam' },
  { name: 'Bank Muamalat' },
  { name: 'Bank Rakyat' },
  { name: 'BSN', len: 16 },
  { name: 'Affin Bank' },
  { name: 'Alliance Bank' },
  { name: 'Agrobank' },
  { name: 'HSBC' },
  { name: 'OCBC' },
  { name: 'Standard Chartered' },
  { name: 'UOB' },
  { name: 'MBSB Bank' },
  { name: 'Al Rajhi Bank' },
  { name: 'GXBank' },
  { name: 'Boost Bank' },
  { name: 'AEON Bank' },
  { name: 'Other · Lain-lain' },
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
