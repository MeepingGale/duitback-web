import type { Metadata } from 'next';
import { CATS, CHILDSUB, MEDSUB, OVERRIDES, SCHEDULE_YA, fmt, medSubCap } from '@/lib/tax';
import { CtaLink, Kicker, SiteFooter, SiteHeader } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Senarai Pelepasan Cukai YA2026 · Tax Relief List',
  description:
    'Every Malaysian personal income tax relief for YA2026 with its cap — pelepasan cukai pendapatan individu: lifestyle, medical, EPF, PRS, SSPN, childcare and more, in English and Bahasa Melayu. Free reference from DuitBack.',
  alternates: { canonical: '/reliefs/' },
  openGraph: {
    title: 'Senarai Pelepasan Cukai YA2026 — every relief and its cap',
    description:
      'The full LHDN personal relief schedule for YA2026, bilingual, with caps, sub-limits and per-child amounts — plus a free local-first tracker.',
    url: '/reliefs/',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Malaysian personal income tax reliefs for YA2026 — the full list with caps',
  inLanguage: ['en', 'ms'],
  author: { '@type': 'Person', name: 'DuitBack' },
  url: 'https://meepinggale.github.io/duitback-web/reliefs/',
};

export default function ReliefsPage() {
  const rows = CATS.filter((c) => c.id !== 'individual');
  const overrideNotes = Object.entries(OVERRIDES)
    .filter(([ya]) => +ya < SCHEDULE_YA) // past years only — future overrides (e.g. tourism ending) aren't "other years" yet
    .map(([ya, o]) => 'YA' + ya + ': ' + Object.entries(o).map(([id, cap]) => {
      const ct = CATS.find((c) => c.id === id);
      return (ct?.en.split(' — ')[0] || id) + ' ' + (cap === 0 ? 'not available' : fmt(cap));
    }).join(' · '))
    .join('. ');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader home="../" />
      <main className="wrap" style={{ paddingBottom: 48 }}>
        <section style={{ padding: '48px 0 8px' }}>
          <Kicker>YA2026 · Year of assessment · Tahun taksiran 2026</Kicker>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '-0.02em', fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.06, margin: '12px 0 14px', maxWidth: 820 }}>
            Senarai pelepasan cukai.
            <br />
            Every relief, every cap.
          </h1>
          <p style={{ fontSize: 15.5, maxWidth: 640, margin: '0 0 10px', color: 'var(--color-neutral-800)' }}>
            The complete LHDN personal relief schedule for Malaysian resident individuals (Form BE/B), YA2026 — the same
            data the <a href="../app/">DuitBack tracker</a> enforces. Every resident also gets the automatic{' '}
            <strong>RM 9,000 individual &amp; dependents relief</strong> — no receipts, no action needed.
          </p>
          <p lang="ms" style={{ fontSize: 13.5, maxWidth: 640, margin: '0 0 22px', color: 'var(--color-neutral-700)' }}>
            Jadual penuh pelepasan cukai pendapatan individu pemastautin untuk tahun taksiran 2026. Setiap pemastautin
            menerima pelepasan individu RM 9,000 secara automatik.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <CtaLink href="../app/">Track yours against these caps · Jejak sekarang →</CtaLink>
          </div>
        </section>

        <section style={{ padding: '28px 0 8px' }}>
          <div style={{ overflowX: 'auto', border: '2px solid var(--color-divider)' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Relief · Pelepasan</th>
                  <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Cap · Had</th>
                  <th>Notes · Nota</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td style={{ minWidth: 190 }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13.5 }}>{c.en}</span>
                      <br />
                      <span lang="ms" style={{ color: 'var(--color-neutral-700)', fontSize: 12.5 }}>{c.bm}</span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                      {c.id === 'donation' ? '10% of income' : c.cap === null ? 'per child' : fmt(c.cap)}
                    </td>
                    <td style={{ fontSize: 12.5, color: 'var(--color-neutral-800)', minWidth: 260 }}>{c.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--color-neutral-700)', marginTop: 8 }}>
            Updated for Budget 2026 (YA2026): learning-disability medical relief RM10,000, childcare to age 12 incl. daycare and transit centres, life insurance extended to children, CCTV under the EV relief, RM1,000 domestic tourism relief. Other years differ · Tahun lain berbeza — {overrideNotes}.
          </p>
        </section>

        <section style={{ padding: '24px 0 8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {/* subgrid shares the kicker/intro/table row heights so both tables start on the same line */}
          <div style={{ display: 'grid', gridTemplateRows: 'subgrid', gridRow: 'span 3', alignContent: 'start' }}>
            <Kicker>Medical sub-limits · Had kecil perubatan</Kicker>
            <p style={{ fontSize: 13, color: 'var(--color-neutral-800)', margin: '8px 0 10px', maxWidth: 480 }}>
              The RM 10,000 medical relief is shared across sub-limits — each capped independently:
            </p>
            <table className="table" style={{ fontSize: 13 }}>
              <tbody>
                {MEDSUB.map((m) => (
                  <tr key={m.id}>
                    <td>{m.label.split(' — ')[0]}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{medSubCap(m.id, SCHEDULE_YA) ? fmt(medSubCap(m.id, SCHEDULE_YA)!) : 'no sub-limit'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'grid', gridTemplateRows: 'subgrid', gridRow: 'span 3', alignContent: 'start' }}>
            <Kicker>Child relief · Pelepasan anak</Kicker>
            <p style={{ fontSize: 13, color: 'var(--color-neutral-800)', margin: '8px 0 10px', maxWidth: 480 }}>
              No overall cap — a fixed amount per child, one claim line each:
            </p>
            <table className="table" style={{ fontSize: 13 }}>
              <tbody>
                {CHILDSUB.map((m) => (
                  <tr key={m.id}>
                    <td>{m.label.split(' — ')[0]}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{fmt(m.amt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ padding: '24px 0 8px' }}>
          <Kicker>Rebates · Rebat cukai</Kicker>
          <p style={{ fontSize: 13, color: 'var(--color-neutral-800)', margin: '8px 0 10px', maxWidth: 640 }}>
            Rebates come off the tax itself, after the scale — the tracker applies all of them:
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ fontSize: 13, maxWidth: 720 }}>
              <tbody>
                <tr><td>Individual rebate · Rebat individu</td><td style={{ textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>RM 400</td><td style={{ color: 'var(--color-neutral-800)', fontSize: 12.5 }}>chargeable income up to RM 35,000</td></tr>
                <tr><td>Spouse rebate · Rebat pasangan</td><td style={{ textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>RM 400</td><td style={{ color: 'var(--color-neutral-800)', fontSize: 12.5 }}>joint assessment, chargeable income up to RM 35,000</td></tr>
                <tr><td>Zakat / fitrah · Zakat</td><td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>amount paid</td><td style={{ color: 'var(--color-neutral-800)', fontSize: 12.5 }}>up to the tax charged</td></tr>
                <tr><td>Departure levy, religious travel · Levi pelepasan</td><td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>levy paid</td><td style={{ color: 'var(--color-neutral-800)', fontSize: 12.5 }}>umrah or pilgrimage, at most two trips a year</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="poster" style={{ margin: '32px calc(50% - 50vw) 0', padding: '36px 0' }}>
          <div className="wrap">
            <p className="big" style={{ margin: '0 0 8px' }}>Caps reset every 31 December — use them or lose them.</p>
            <p style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.4, maxWidth: 680, margin: '0 0 18px' }}>
              DuitBack tracks your claims against this exact schedule, free, in your browser.
            </p>
            <CtaLink href="../app/" variant="onRed">Open the tracker · Mula menjejak →</CtaLink>
          </div>
        </section>

        <p style={{ fontSize: 11.5, color: 'var(--color-neutral-700)', marginTop: 28 }}>
          Unofficial reference · estimates of the LHDN schedule, not tax advice — confirm against MyTax before filing.{' '}
          <span lang="ms">Rujukan tidak rasmi — sahkan dengan MyTax sebelum memfailkan.</span>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
