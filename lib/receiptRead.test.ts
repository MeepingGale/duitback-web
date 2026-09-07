import { describe, expect, it } from 'vitest';
import { parseReceiptText, suggestCategory } from './receiptRead';

const today = new Date('2026-09-07T00:00:00Z');
const read = (t: string, einvoice = false) => parseReceiptText(t, { today, einvoice });

describe('parseReceiptText', () => {
  it('reads a clinic receipt: merchant, date, the total rather than the cash tendered, and the category', () => {
    const r = read(`KLINIK MEDIVIRON SDN BHD
No 12, Jalan Damai, Kuala Lumpur
Tel: 03-12345678
TAX INVOICE
Date: 14/05/2026 10:32
Consultation           60.00
Medicine               60.00
Subtotal              120.00
Total              RM120.00
Cash                  150.00
Change                 30.00
Thank you`);
    expect(r).toMatchObject({ merchant: 'Klinik Mediviron Sdn Bhd', date: '2026-05-14', amount: 120, cat: 'medical', proof: 'receipt' });
  });

  it('understands Malay totals and dates, and pharmacy chains', () => {
    const r = read(`GUARDIAN HEALTH AND BEAUTY SDN BHD
LOT 12 SUNWAY PYRAMID
Tarikh: 02-03-2026
Vitamin C 30s          25.90
Panadol                20.00
JUMLAH             RM 45.90
TUNAI                  50.00
BAKI                    4.10`);
    expect(r).toMatchObject({ merchant: 'Guardian Health And Beauty Sdn Bhd', date: '2026-03-02', amount: 45.9, cat: 'medical' });
  });

  it('takes the grand total with a thousands separator and maps a bookshop to lifestyle', () => {
    const r = read(`POPULAR BOOK CO. (M) SDN BHD
Receipt No: 000123
15 Jan 2026
Atomic Habits                   59.90
Textbooks                    1,240.10
SUB TOTAL                    1,300.00
GRAND TOTAL                  1,300.00`);
    expect(r).toMatchObject({ merchant: 'Popular Book Co. (M) Sdn Bhd', date: '2026-01-15', amount: 1300, cat: 'lifestyle' });
  });

  it('reads a bill with "amount due" and a month-name date', () => {
    const r = read(`unifi
TM TECHNOLOGY SERVICES SDN BHD
Bill date 05 Aug 2026
Previous balance 129.00
Payment received -129.00
Current charges 129.00
Total amount due RM 129.00`);
    expect(r).toMatchObject({ merchant: 'unifi', date: '2026-08-05', amount: 129, cat: 'lifestyle' });
  });

  it('maps a gym to sports and keeps the largest total when the total line repeats', () => {
    const r = read(`CELEBRITY FITNESS
Membership fee            1,200.00
TOTAL                     1,200.00
TOTAL PAID                1,200.00`);
    expect(r).toMatchObject({ amount: 1200, cat: 'sports' });
  });

  it('calls a premium statement a statement, maps the insurer, and refuses a date in the future', () => {
    const r = read(`PRUDENTIAL ASSURANCE MALAYSIA BERHAD
PREMIUM STATEMENT
Policy 1234567
Total premium paid           2,400.00
Statement date 31/12/2026`);
    expect(r).toMatchObject({ amount: 2400, cat: 'life_ins', proof: 'statement' });
    expect(r.date).toBeUndefined();
  });

  it('marks an e-invoice printout and reads its payable amount', () => {
    const r = read(`e-Invoice
KLINIK ABC SDN BHD
UUID F9D425P6DS7D8IU
Consultation 150.00
Total Payable Amount (RM) 150.00`);
    expect(r).toMatchObject({ merchant: 'Klinik Abc Sdn Bhd', amount: 150, cat: 'medical', proof: 'einvoice' });
  });

  it('falls back to the largest figure when no total line exists, and skips subtotal-only lines', () => {
    expect(read('ABC STORE\nItem A 10.00\nItem B 25.00').amount).toBe(25);
    expect(read('ABC STORE\nSubtotal 90.00\nSST 6% 5.40').amount).toBe(90);
  });

  it('accepts a whole-number total when it is prefixed with RM, but not bare integers like quantities', () => {
    expect(read('KEDAI ABC\nTotal RM120').amount).toBe(120);
    expect(read('KEDAI ABC\nJumlah RM 1,250').amount).toBe(1250);
    expect(read('KEDAI ABC\nQty 3 x Item 12.00\nTotal 36.00').amount).toBe(36);
    expect(read('KEDAI ABC\nInvoice 2026\nItem 12.00').amount).toBe(12);
  });

  it('prefers the date next to a date label over other dates on the receipt', () => {
    const r = read('KEDAI ABC\nExpiry 01/01/2028\nTarikh 14.05.26\nTotal 10.00');
    expect(r.date).toBe('2026-05-14');
    expect(read('KEDAI ABC\n2026-05-14\nTotal 10.00').date).toBe('2026-05-14');
    expect(read('KEDAI ABC\n14 Mei 2026\nTotal 10.00').date).toBe('2026-05-14');
  });

  it('returns nothing for unreadable noise, without throwing', () => {
    const r = read('^^^ ,,, ... ---');
    expect(r.merchant).toBeUndefined(); expect(r.amount).toBeUndefined(); expect(r.date).toBeUndefined(); expect(r.cat).toBeUndefined();
  });
});

describe('suggestCategory', () => {
  it('maps common Malaysian merchants', () => {
    expect(suggestCategory('Unifi bill')?.cat).toBe('lifestyle');
    expect(suggestCategory('Kolej Tunku Abdul Rahman yuran pengajian')?.cat).toBe('edu_self');
    expect(suggestCategory('Taska Ceria Sdn Bhd')?.cat).toBe('childcare');
    expect(suggestCategory('Principal PRS Plus')?.cat).toBe('prs');
    expect(suggestCategory('Tabung Masjid Al-Falah derma')?.cat).toBe('donation');
    expect(suggestCategory('ChargEV session')?.cat).toBe('ev');
    expect(suggestCategory('Housing loan interest statement')?.cat).toBe('housing');
  });
  it('gives nothing rather than a guess for an unknown merchant', () => {
    expect(suggestCategory('Kedai Runcit Pak Abu')).toBeNull();
  });
});
