import type { Metadata } from 'next';
import { CtaLink, Kicker, SiteFooter, SiteHeader } from '@/components/ui';
import { PcbCalculator } from '@/components/PcbCalculator';

export const metadata: Metadata = {
  title: 'Kalkulator PCB 2026 · PCB / MTD Calculator Malaysia',
  description:
    'Free PCB calculator for Malaysia — the LHDN computerised MTD formula, not a lookup table. Enter monthly salary and bonus to see the monthly deduction, the bonus-month deduction and the year total. Kira potongan cukai bulanan (PCB) anda, percuma.',
  alternates: { canonical: '/pcb/' },
  openGraph: {
    title: 'Kalkulator PCB — Malaysian monthly tax deduction (MTD), computed the LHDN way',
    description:
      'Monthly salary + bonus in, PCB out: per month, bonus month and full year, using the computerised calculation LHDN specifies for payroll systems.',
    url: '/pcb/',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Kalkulator PCB · PCB / MTD Calculator Malaysia',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  inLanguage: ['en', 'ms'],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'MYR' },
  url: 'https://meepinggale.github.io/duitback-web/pcb/',
  author: { '@type': 'Person', name: 'DuitBack' },
};

const VARS: Array<[string, string]> = [
  ['P', 'Chargeable income for the year: pay to date + this month + the remaining months, minus EPF (capped RM 4,000), RM 9,000 individual deduction, RM 4,000 spouse deduction (category 2) and RM 2,000 per qualifying child.'],
  ['M, R, B', 'The bracket floor, rate and base tax from LHDN’s Table 1 — B already nets off the RM 400 (or RM 800 for category 2) rebate for chargeable income up to RM 35,000.'],
  ['Z, X', 'Zakat paid through payroll so far, and PCB already deducted this year.'],
  ['n + 1', 'Months left in the year, including the current one — the remaining tax is spread evenly across them.'],
  ['Bonus', 'Additional remuneration is taxed on top: the year’s tax with the bonus, minus the year’s tax without it, deducted in the month it is paid.'],
];

export default function PcbPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader home="../" />
      <main className="wrap" style={{ paddingBottom: 48 }}>
        <section className="hero" style={{ paddingBottom: 28 }}>
          <Kicker>PCB · MTD · Potongan Cukai Bulanan</Kicker>
          <h1>Kalkulator PCB.<br />Know your monthly deduction.</h1>
          <p className="lead">
            The PCB your employer deducts each month, computed the way LHDN specifies for payroll systems — the computerised calculation method, not a lookup table. Monthly salary and bonus in; monthly, bonus-month and full-year deductions out. Free, no sign-up, nothing leaves your browser.
          </p>
          <p style={{ fontSize: 13.5, color: 'var(--color-neutral-700)', maxWidth: 620, margin: '-12px 0 0' }} lang="ms">
            Kira PCB anda mengikut kaedah pengiraan berkomputer LHDN — potongan sebulan, bulan bonus dan jumlah setahun. Percuma, tanpa pendaftaran.
          </p>
        </section>

        <PcbCalculator />

        <section style={{ padding: '36px 0 8px' }}>
          <Kicker>How PCB is calculated · Cara PCB dikira</Kicker>
          <p style={{ fontSize: 15, margin: '10px 0 6px', maxWidth: 720 }}>
            Every month, payroll re-estimates the whole year and deducts the share of tax still owed:
          </p>
          <p className="mono" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(16px, 2.6vw, 22px)', margin: '0 0 14px' }}>
            PCB = [ (P − M) × R + B − (Z + X) ] ÷ (n + 1)
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ fontSize: 13.5, maxWidth: 820 }}>
              <tbody>
                {VARS.map(([k, v]) => (
                  <tr key={k}>
                    <td className="mono" style={{ whiteSpace: 'nowrap', fontFamily: 'var(--font-heading)', fontWeight: 800, width: 90 }}>{k}</td>
                    <td style={{ color: 'var(--color-neutral-800)' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-neutral-800)', margin: '14px 0 0', maxWidth: 720 }}>
            Amounts are truncated to two decimals and each deduction rounded up to the nearest 5 sen; a month under RM 10 is not deducted, and the formula catches up later in the year. Source: LHDN’s <em>Specification for MTD Calculations Using Computerised Calculation Method</em>, published each year for payroll vendors. Your payslip may differ if you claimed extra deductions on Form TP1, pay zakat through salary, or had a mid-year change of employer.{' '}
            <span lang="ms">Sumber: Spesifikasi Kaedah Pengiraan Berkomputer PCB, LHDN. Slip gaji anda mungkin berbeza jika ada potongan TP1, zakat gaji atau tukar majikan.</span>
          </p>
        </section>

        <section className="poster" style={{ margin: '32px calc(50% - 50vw) 0', padding: '36px 0' }}>
          <div className="wrap">
            <p className="big" style={{ margin: '0 0 8px' }}>PCB is what you prepay. Reliefs decide what you get back.</p>
            <p style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.4, maxWidth: 680, margin: '0 0 18px' }}>
              DuitBack tracks every relief against the LHDN caps all year and estimates your refund — with this PCB estimate filled in automatically.
            </p>
            <CtaLink href="../app/" variant="onRed">Open the tracker · Mula menjejak →</CtaLink>
          </div>
        </section>
        <p style={{ fontSize: 12, color: 'var(--color-neutral-700)', margin: '18px 0 0' }}>
          Unofficial estimate — confirm figures with your payroll or LHDN’s e-PCB. Not tax advice. <span lang="ms">Anggaran tidak rasmi — sahkan dengan majikan atau e-PCB LHDN.</span>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
